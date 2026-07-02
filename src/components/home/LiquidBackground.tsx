import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Kalıcı sıvı zemin: fullscreen fbm shader, mouse ripple, scroll'la palet kayması.
// Tek RAF: render gsap.ticker üzerinden döner (Lenis ve blob ile aynı loop).

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uRes;
uniform float uScroll;
uniform float uLight;
uniform float uStill; /* reduced-motion: 1 = donuk */

varying vec2 vUv;

/* Ashima 2D simplex */
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p = p * 2.03 + vec2(11.7, 5.3);
    a *= 0.5;
  }
  return v;
}

/* uScroll etrafında yumuşak tepe */
float bell(float x, float c, float w) {
  float d = (x - c) / w;
  return exp(-d * d);
}

void main() {
  vec2 uv = vUv;
  vec2 suv = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * (1.0 - uStill);

  /* mouse ripple: exp falloff * sin dalgası, uv'yi büker */
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float d = length(suv - m);
  float ripple = exp(-d * 5.5) * sin(d * 38.0 - t * 3.2) * (1.0 - uStill);
  vec2 ruv = suv + normalize(suv - m + 1e-4) * ripple * 0.02;

  float flow = t * 0.06;
  float n1 = fbm(ruv * 2.4 + vec2(flow, -flow * 0.6) + uScroll * 0.8);
  float n2 = fbm(ruv * 3.1 - vec2(flow * 0.7, flow) + 4.0);
  float n3 = fbm(ruv * 2.0 + vec2(-flow * 0.5, flow * 0.8) + 9.0);

  /* palet */
  vec3 baseD = vec3(0.0196, 0.0275, 0.0431);  /* #05070B */
  vec3 depthD = vec3(0.0314, 0.0667, 0.1216); /* #08111F */
  vec3 purple = vec3(0.545, 0.498, 1.0);      /* #8B7FFF */
  vec3 gold = vec3(0.784, 0.647, 0.416);      /* #C8A56A */

  vec3 baseL = vec3(0.969, 0.957, 0.933);     /* #F7F4EE */
  vec3 depthL = vec3(0.918, 0.902, 0.867);
  vec3 purpleL = vec3(0.325, 0.290, 0.718);   /* #534AB7 */
  vec3 goldL = vec3(0.659, 0.514, 0.290);     /* #A8834A */

  vec3 base = mix(baseD, baseL, uLight);
  vec3 depth = mix(depthD, depthL, uLight);
  vec3 stainP = mix(purple, purpleL, uLight);
  vec3 stainG = mix(gold, goldL, uLight);

  /* section'a göre leke ağırlığı: work'te mor, tutorials'ta altın, contact'ta derinlik */
  float half_ = mix(1.0, 0.5, uLight);
  float wP = 0.13 * half_ * (1.0 + 0.9 * bell(uScroll, 0.3, 0.16));
  float wG = 0.05 * half_ * (1.0 + 1.4 * bell(uScroll, 0.6, 0.14));
  float wD = 0.45 + 0.4 * bell(uScroll, 0.95, 0.2);

  vec3 col = mix(base, depth, smoothstep(0.25, 0.85, n1 * 0.5 + 0.5) * wD);
  col = mix(col, stainP, smoothstep(0.55, 0.95, n2 * 0.5 + 0.5) * wP);
  col = mix(col, stainG, smoothstep(0.6, 0.98, n3 * 0.5 + 0.5) * wG);

  /* ripple parlaması */
  col += stainP * ripple * 0.05 * (1.0 - uLight * 0.5);

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export default function LiquidBackground() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mount.current) return;
    const el = mount.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    // pixelRatio sabit 1; drawing buffer 0.75x (mobilde 0.5x), CSS %100'e ölçeklenir
    const bufScale = mobile ? 0.5 : 0.75;
    renderer.setPixelRatio(1);
    const setBufferSize = () => {
      renderer.setSize(window.innerWidth * bufScale, window.innerHeight * bufScale, false);
    };
    setBufferSize();
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: {
        value: new THREE.Vector2(window.innerWidth * bufScale, window.innerHeight * bufScale),
      },
      uScroll: { value: 0 },
      uLight: { value: document.documentElement.classList.contains('dark') ? 0 : 1 },
      uStill: { value: reduced ? 1 : 0 },
    };

    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms }),
    );
    scene.add(quad);

    const mouseTarget = new THREE.Vector2(0.5, 0.5);
    const onMove = (e: MouseEvent) => {
      mouseTarget.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const onResize = () => {
      setBufferSize();
      uniforms.uRes.value.set(window.innerWidth * bufScale, window.innerHeight * bufScale);
    };
    window.addEventListener('resize', onResize);

    // Hero viewport dışındayken sürekli render pause; scroll değişiminde
    // tek kare render (palet kayması donmasın)
    let heroVisible = true;
    const heroEl = document.querySelector('.hero-section');
    const heroIO = heroEl
      ? new IntersectionObserver(([entry]) => {
          heroVisible = entry.isIntersecting;
        })
      : null;
    if (heroEl && heroIO) heroIO.observe(heroEl);
    let lastScrollY = -1;

    const themeObserver = new MutationObserver(() => {
      uniforms.uLight.value = document.documentElement.classList.contains('dark') ? 0 : 1;
      if (reduced) renderer.render(scene, camera);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const tick = () => {
      const sy = window.scrollY;
      if (!heroVisible && sy === lastScrollY) return; // pause: hero dışı + scroll sabit
      lastScrollY = sy;
      uniforms.uTime.value += gsap.ticker.deltaRatio(60) / 60;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      uniforms.uScroll.value = max > 0 ? sy / max : 0;
      uniforms.uMouse.value.lerp(mouseTarget, 0.06);
      renderer.render(scene, camera);
    };

    if (reduced) {
      renderer.render(scene, camera); // statik tek kare
    } else {
      gsap.ticker.add(tick);
    }

    return () => {
      gsap.ticker.remove(tick);
      heroIO?.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      themeObserver.disconnect();
      quad.geometry.dispose();
      (quad.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mount}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
