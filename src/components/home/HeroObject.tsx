import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroObject() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mount.current) return;
    const el = mount.current;
    const w = el.clientWidth;
    const h = el.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const getAccent = () => {
      const c = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim();
      return new THREE.Color(c || '#8B7FFF');
    };

    const getAccentDeep = () => {
      const c = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-deep')
        .trim();
      return new THREE.Color(c || '#26215C');
    };

    const outerMat = new THREE.MeshBasicMaterial({
      color: getAccent(),
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const outer = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.9, 1),
      outerMat,
    );
    scene.add(outer);

    const innerMat = new THREE.MeshBasicMaterial({
      color: getAccentDeep(),
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 0),
      innerMat,
    );
    scene.add(inner);

    const positions: number[] = [];
    for (let i = 0; i < 200; i++) {
      const r = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const pmat = new THREE.PointsMaterial({
      color: getAccent(),
      size: 0.025,
      transparent: true,
      opacity: 0.4,
    });
    const points = new THREE.Points(pgeo, pmat);
    scene.add(points);

    let raf = 0;
    let frame = 0;
    const loop = () => {
      frame++;
      outer.rotation.x += 0.0015;
      outer.rotation.y += 0.0022;
      inner.rotation.x -= 0.001;
      inner.rotation.y -= 0.0018;
      points.rotation.y += 0.0004;
      const s = 1 + Math.sin(frame * 0.008) * 0.04;
      outer.scale.set(s, s, s);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    const themeObserver = new MutationObserver(() => {
      outerMat.color = getAccent();
      innerMat.color = getAccentDeep();
      pmat.color = getAccent();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      themeObserver.disconnect();
      outerMat.dispose();
      innerMat.dispose();
      pmat.dispose();
      outer.geometry.dispose();
      inner.geometry.dispose();
      pgeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mount} className="w-full h-[320px] md:h-[420px]" />;
}
