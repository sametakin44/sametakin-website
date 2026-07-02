import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Hero'daki sıvı cam blob. Hero scrub timeline'ı `params` proxy'sini tween'ler;
// blob her karede proxy'den okur (tek RAF: gsap.ticker).
export interface BlobParams {
  scale: number;
  x: number; // -1..1, ekran genişliğine göre kayma
  camZ: number;
  opacity: number;
}

const SIMPLEX_3D = /* glsl */ `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise3(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export default function LiquidBlob({ params }: { params: BlobParams }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mount.current) return;
    const el = mount.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;

    const w = el.clientWidth;
    const h = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 2));
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 6;

    // Marka paletinde env map: gece laciverti + mor parıltı + ince altın bant.
    // (RoomEnvironment'ın beyaz kutu ışıkları "sıvı" yerine "krom" okutuyordu.)
    const makeEnvCanvas = (light: boolean) => {
      const cv = document.createElement('canvas');
      cv.width = 128;
      cv.height = 64;
      const c = cv.getContext('2d')!;
      const grad = c.createLinearGradient(0, 0, 0, 64);
      if (light) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.55, '#efe9dc');
        grad.addColorStop(1, '#c9c2b2');
      } else {
        grad.addColorStop(0, '#2a2250');
        grad.addColorStop(0.5, '#0a0e1c');
        grad.addColorStop(1, '#05070b');
      }
      c.fillStyle = grad;
      c.fillRect(0, 0, 128, 64);
      // mor parıltı
      const glow = c.createRadialGradient(38, 18, 2, 38, 18, 26);
      glow.addColorStop(0, light ? 'rgba(83,74,183,0.55)' : 'rgba(139,127,255,0.8)');
      glow.addColorStop(1, 'rgba(139,127,255,0)');
      c.fillStyle = glow;
      c.fillRect(0, 0, 128, 64);
      // ince altın bant
      c.fillStyle = light ? 'rgba(168,131,74,0.4)' : 'rgba(200,165,106,0.5)';
      c.fillRect(86, 30, 30, 3);
      return cv;
    };

    const pmrem = new THREE.PMREMGenerator(renderer);
    const makeEnv = (light: boolean) => {
      const tex = new THREE.CanvasTexture(makeEnvCanvas(light));
      tex.mapping = THREE.EquirectangularReflectionMapping;
      const rt = pmrem.fromEquirectangular(tex);
      tex.dispose();
      return rt.texture;
    };
    const envDark = makeEnv(false);
    const envLight = makeEnv(true);
    scene.environment = envDark;

    // Işıklar: mor key, altın kicker, soğuk fill
    const key = new THREE.DirectionalLight(0x8b7fff, 2.2);
    key.position.set(3, 3, 4);
    scene.add(key);
    const kicker = new THREE.DirectionalLight(0xc8a56a, 0.9);
    kicker.position.set(-4, -1, 2);
    scene.add(kicker);
    const fill = new THREE.DirectionalLight(0x9ab0d0, 0.5);
    fill.position.set(0, -3, -3);
    scene.add(fill);

    const timeUniform = { value: 0 };
    const injectDisplacement = (shader: { uniforms: Record<string, unknown>; vertexShader: string }) => {
      shader.uniforms.uTime = timeUniform;
      shader.vertexShader = `
        uniform float uTime;
        ${SIMPLEX_3D}
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float dn = snoise3(normal * 1.6 + vec3(uTime * 0.35));
        float dw = sin(position.y * 5.0 + uTime * 1.2) * 0.03;
        transformed += normal * (dn * 0.13 + dw);`,
      );
    };

    const segments = mobile ? 64 : 128;
    const geo = new THREE.SphereGeometry(1.15, segments, segments);

    // Koyu sıvı cam: yansıma kısık, derinlik moru attenuation'dan gelir.
    let material: THREE.Material;
    if (mobile) {
      // GPU tasarrufu: transmission yerine metalik yüzey
      const m = new THREE.MeshStandardMaterial({
        color: 0x08111f,
        metalness: 0.85,
        roughness: 0.3,
        envMapIntensity: 0.5,
        transparent: true,
      });
      m.onBeforeCompile = injectDisplacement;
      material = m;
    } else {
      const m = new THREE.MeshPhysicalMaterial({
        color: 0x05070b,
        transmission: 0.85,
        thickness: 2.0,
        ior: 1.42,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.7,
        attenuationColor: new THREE.Color(0x8b7fff),
        attenuationDistance: 2.2,
        transparent: true,
      });
      m.onBeforeCompile = injectDisplacement;
      material = m;
    }

    const blob = new THREE.Mesh(geo, material);
    scene.add(blob);

    // Light mode: kağıt üstünde açık cam damla
    const applyTheme = () => {
      const light = !document.documentElement.classList.contains('dark');
      const m = material as THREE.MeshPhysicalMaterial;
      scene.environment = light ? envLight : envDark;
      m.color.set(light ? 0xdcd6c8 : mobile ? 0x08111f : 0x05070b);
      m.envMapIntensity = light ? 0.8 : mobile ? 0.6 : 0.7;
      key.intensity = light ? 1.4 : 2.2;
    };
    applyTheme();
    const blobThemeObserver = new MutationObserver(applyTheme);
    blobThemeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Mouse-follow tilt (lerp 0.04)
    const tiltTarget = new THREE.Vector2(0, 0);
    const onMove = (e: MouseEvent) => {
      tiltTarget.set(
        (e.clientY / window.innerHeight - 0.5) * 0.5,
        (e.clientX / window.innerWidth - 0.5) * 0.7,
      );
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // Hero viewport dışındayken render pause
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);

    const tick = () => {
      if (!visible) return;
      timeUniform.value += gsap.ticker.deltaRatio(60) / 60;
      blob.rotation.x += (tiltTarget.x - blob.rotation.x) * 0.04;
      blob.rotation.y += (tiltTarget.y - blob.rotation.y) * 0.04;
      blob.rotation.z += 0.0008;
      blob.scale.setScalar(params.scale);
      blob.position.x = params.x * 1.6;
      camera.position.z = params.camZ;
      (material as THREE.MeshPhysicalMaterial).opacity = params.opacity;
      renderer.render(scene, camera);
    };

    if (reduced) {
      params.opacity = 1;
      tick(); // tek kare
    } else {
      gsap.ticker.add(tick);
    }

    const onResize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      blobThemeObserver.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      material.dispose();
      envDark.dispose();
      envLight.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} className="w-full h-full" />;
}
