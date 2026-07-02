import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Spiral partikül galaksi — hero'da ismin ARKASINDA döner.
// Hero pin scrub'ı `params`ı sürer: scatter 0→1'de partiküller merkezden
// saçılır ("sinyal dağılıyor"), opacity düşer, dönüş hızlanır.
export interface GalaxyParams {
  scatter: number; // 0..1
  opacity: number; // 1 → 0.15 (scrub)
}

const RADIUS = 2.4;
const BRANCHES = 3;
const SPIN = 1.2;
const RANDOMNESS = 0.25;
const RANDOMNESS_POWER = 2.8;
const SCATTER_DIST = 3.5;

const DARK = {
  core: new THREE.Color(0xc8a56a),
  arm: new THREE.Color(0x8b7fff),
  dust: new THREE.Color(0xf2ebdd),
};
const LIGHT = {
  core: new THREE.Color(0x3a3266),
  arm: new THREE.Color(0x534ab7),
  dust: new THREE.Color(0x8b6f3a),
};

export default function GalaxyObject({ params }: { params: GalaxyParams }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mount.current) return;
    const el = mount.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const count = mobile ? 6000 : 18000;

    const w = el.clientWidth;
    const h = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 5;

    // ── Galaksi üretimi ──
    const base = new Float32Array(count * 3);
    const positions = new Float32Array(count * 3);
    const scatterDir = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const dustMask: boolean[] = new Array(count);

    const tmp = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random() * RADIUS;
      const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spinAngle = r * SPIN;

      const rand = (axisScale: number) =>
        Math.pow(Math.random(), RANDOMNESS_POWER) *
        (Math.random() < 0.5 ? 1 : -1) *
        RANDOMNESS *
        r *
        axisScale;

      const x = Math.cos(branch + spinAngle) * r + rand(1);
      const y = rand(0.6);
      const z = Math.sin(branch + spinAngle) * r + rand(1);

      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;

      // Saçılma yönü: merkezden dışa + hafif rastgele sapma
      tmp.set(x, y, z).normalize();
      scatterDir[i3] = tmp.x + (Math.random() - 0.5) * 0.5;
      scatterDir[i3 + 1] = tmp.y + (Math.random() - 0.5) * 0.5;
      scatterDir[i3 + 2] = tmp.z + (Math.random() - 0.5) * 0.5;

      dustMask[i] = Math.random() < 0.08;
    }
    positions.set(base);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const applyColors = (light: boolean) => {
      const pal = light ? LIGHT : DARK;
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        if (dustMask[i]) {
          c.copy(pal.dust);
        } else {
          const r = Math.sqrt(base[i3] ** 2 + base[i3 + 2] ** 2);
          c.copy(pal.core).lerp(pal.arm, Math.min(r / RADIUS, 1));
        }
        colors[i3] = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;
      }
      geo.attributes.color.needsUpdate = true;
    };

    const material = new THREE.PointsMaterial({
      size: 0.012,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      opacity: 1,
    });

    const points = new THREE.Points(geo, material);
    const group = new THREE.Group();
    group.rotation.x = -0.35; // perspektif eğimi
    group.position.x = mobile ? 0 : 1.15; // sağda, ismin arkasında
    group.add(points);
    scene.add(group);

    // Tema: light'ta additive kağıtta kaybolur → normal blending + koyu palet
    let lightMode = !document.documentElement.classList.contains('dark');
    const renderIfStill = () => {
      if (reduced) renderer.render(scene, camera);
    };
    const applyTheme = () => {
      lightMode = !document.documentElement.classList.contains('dark');
      material.blending = lightMode ? THREE.NormalBlending : THREE.AdditiveBlending;
      material.needsUpdate = true;
      applyColors(lightMode);
      renderIfStill();
    };
    applyTheme();
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Mouse parallax: ±0.05 radyan, lerp 0.03
    const tilt = new THREE.Vector2(0, 0);
    const tiltTarget = new THREE.Vector2(0, 0);
    const onMove = (e: MouseEvent) => {
      tiltTarget.set(
        (e.clientY / window.innerHeight - 0.5) * 0.1,
        (e.clientX / window.innerWidth - 0.5) * 0.1,
      );
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // Hero viewport dışındayken render pause (ScrollTrigger yerine IO —
    // scrub geri sarınca da doğru çalışır)
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);

    let appliedScatter = -1;
    const applyScatter = () => {
      const s = params.scatter;
      if (Math.abs(s - appliedScatter) < 0.0005) return;
      appliedScatter = s;
      const d = s * SCATTER_DIST;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = base[i3] + scatterDir[i3] * d;
        positions[i3 + 1] = base[i3 + 1] + scatterDir[i3 + 1] * d;
        positions[i3 + 2] = base[i3 + 2] + scatterDir[i3 + 2] * d;
      }
      geo.attributes.position.needsUpdate = true;
    };

    const tick = () => {
      if (!visible) return;
      applyScatter();
      const speed = 0.0008 + params.scatter * (0.003 - 0.0008);
      points.rotation.y += speed * gsap.ticker.deltaRatio(60);
      tilt.lerp(tiltTarget, 0.03);
      group.rotation.x = -0.35 + tilt.x;
      group.rotation.y = tilt.y;
      material.opacity = params.opacity * (lightMode ? 0.7 : 1);
      renderer.render(scene, camera);
    };

    if (reduced) {
      material.opacity = lightMode ? 0.7 : 1;
      renderer.render(scene, camera); // statik tek kare
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
      themeObserver.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} className="w-full h-full" />;
}
