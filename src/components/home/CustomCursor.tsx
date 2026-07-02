import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// 6px dot + 28px halka. Halka lerp 0.15 ile takip eder; [data-cursor]
// elemanlarında 48px'e büyür ve mono micro-label gösterir.
// Touch cihazda ve reduced-motion'da hiç render edilmez.
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current!;

    document.documentElement.classList.add('custom-cursor-on');

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    let hoverEl: HTMLElement | null = null;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-cursor], a, button',
      );
      if (target !== hoverEl) {
        hoverEl = target;
        const text = target?.dataset.cursor ?? '';
        label.textContent = text;
        gsap.to(ring, {
          width: target ? 48 : 28,
          height: target ? 48 : 28,
          duration: 0.35,
          ease: 'power3.out',
        });
        gsap.to(label, { opacity: text ? 1 : 0, duration: 0.25 });
      }
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.15;
      ringPos.y += (pos.y - ringPos.y) * 0.15;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      document.documentElement.classList.remove('custom-cursor-on');
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 z-[100] w-[6px] h-[6px] rounded-full bg-accent pointer-events-none"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="fixed top-0 left-0 z-[100] w-[28px] h-[28px] rounded-full border border-accent/60 pointer-events-none flex items-center justify-center"
      >
        <span
          ref={labelRef}
          className="font-mono text-[8px] uppercase tracking-[0.2em] text-accent opacity-0 select-none"
        />
      </div>
    </>
  );
}
