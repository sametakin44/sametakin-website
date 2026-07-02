import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import LiquidBackground from './LiquidBackground';
import GalaxyObject, { type GalaxyParams } from './GalaxyObject';
import CustomCursor from './CustomCursor';
import YouTubeThumbnail from '../ui/YouTubeThumbnail';
import { projects } from '../../data/projects';
import { tutorialPlaylists } from '../../data/playlists';
import { getPlaylistData } from '../../lib/youtube';

// "still water, deep signal" — ana sayfanın tamamı tek React island.
// GSAP + Lenis + Three koordinasyonu bu root'ta yaşar; tek RAF = gsap.ticker.

const playlistPanels = tutorialPlaylists
  .map((meta) => ({ meta, data: getPlaylistData(meta.id) }))
  .filter((p) => p.data !== null);

const writingDrafts = [
  {
    title: 'The AI void in public services: Beyond e-Devlet and e-Nabız',
    desc: 'How bloated bureaucracy and painfully slow judicial processes persist while scalable, autonomous AI solutions are ignored.',
    reading: '~1 min read',
    href: '/writing/ai-void-public-services',
  },
  {
    title: 'Artificial agendas vs. Artificial Intelligence in parliament',
    desc: 'While the tech ecosystem builds autonomous futures, lawmakers debate distractions. A look at the widening gap between state priorities and tech reality.',
    reading: '~1 min read',
    href: '/writing/artificial-agendas-vs-ai',
  },
];

const contactChannels = [
  { label: 'Email', value: 'sametakin44@gmail.com', href: 'mailto:sametakin44@gmail.com' },
  { label: 'LinkedIn', value: '/in/sametakin44', href: 'https://linkedin.com/in/sametakin44' },
  { label: 'YouTube', value: '@sametakin44', href: 'https://youtube.com/@sametakin44' },
  { label: 'GitHub', value: '/sametakin44', href: 'https://github.com/sametakin44' },
];

// Deterministik dalgalı daire (liquid wipe maskesi) — feTurbulence yerine
// her tarayıcıda çalışan JS üretimli organik kenar. Scale, path'in içine
// gömülür: Chromium objectBoundingBox clipPath'lerde child transform'u
// yok saydığı için d attribute'u yeniden üretilir.
function wobblyCirclePath(scale: number): string {
  const pts: string[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * 2;
    const r =
      (0.5 + 0.07 * Math.sin(th * 5) + 0.045 * Math.sin(th * 9 + 1.7) + 0.03 * Math.sin(th * 13 + 4.1)) *
      scale;
    const x = 0.5 + Math.cos(th) * r;
    const y = 0.5 + Math.sin(th) * r;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(4)},${y.toFixed(4)}`);
  }
  return pts.join(' ') + ' Z';
}

const Chars = ({ text }: { text: string }) => (
  <>
    {text.split('').map((c, i) => (
      <span key={i} className="hero-char inline-block will-change-transform">
        {c === ' ' ? ' ' : c}
      </span>
    ))}
  </>
);

export default function HomeExperience() {
  const root = useRef<HTMLDivElement>(null);
  const galaxyParams = useRef<GalaxyParams>({ scatter: 0, opacity: 0 }).current;
  const wipeScale = useRef({ value: 0.0001 }).current;
  const previewRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [previewIdx, setPreviewIdx] = useState<number>(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Lenis smooth scroll, ScrollTrigger ile senkron ──
    // TEK ticker: lenis.raf yalnızca burada, gsap.ticker üzerinden çağrılır.
    let lenis: Lenis | null = null;
    let lenisRaf: ((t: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 1.0, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      lenisRaf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context((self) => {
      const q = self.selector!;

      if (reduced) {
        // Statik fallback: her şey görünür, pin/parallax yok
        galaxyParams.opacity = 1;
        gsap.set(q('.hero-line-inner'), { yPercent: 0 });
        wipeScale.value = 3;
        applyWipe();
        gsap.set(q('.stmt-word-inner'), { yPercent: 0 });
        return;
      }

      // ── Yüklenme koreografisi: kicker → başlık satırları → blob ──
      gsap.set(q('.hero-line-inner'), { yPercent: 110 });
      gsap.set(q('.hero-kicker, .hero-scroll-hint'), { opacity: 0, y: 14 });
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .to(q('.hero-kicker'), { opacity: 1, y: 0, duration: 0.6 }, 0)
        .to(q('.hero-line-inner'), { yPercent: 0, duration: 0.9, stagger: 0.12 }, 0.15)
        .to(galaxyParams, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.4)
        .to(q('.hero-scroll-hint'), { opacity: 1, y: 0, duration: 0.6 }, 0.9);

      // ── Statement: liquid wipe (onEnter'da bir kez) + kelime reveal ──
      gsap.set(q('.stmt-word-inner'), { yPercent: 110 });
      ScrollTrigger.create({
        trigger: q('.stmt-section')[0],
        start: 'top 65%',
        once: true,
        onEnter: () => {
          gsap.to(wipeScale, {
            value: 3,
            duration: 1.1,
            ease: 'power2.inOut',
            onUpdate: applyWipe,
          });
          gsap.to(q('.stmt-word-inner'), {
            yPercent: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.06,
            delay: 0.25,
          });
        },
      });

      // ── Satır reveal'ları (work + writing): onEnter bir kez ──
      for (const row of q('.reveal-row') as HTMLElement[]) {
        gsap.from(row, {
          y: 32,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        });
      }

      // ── Pin'ler yalnızca desktop + no-preference ──
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        // Hero pin: başlık harfleri süzülür, galaksi saçılıp söner
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: q('.hero-section')[0],
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 1.2,
          },
        });
        heroTl
          .to(q('.hero-char'), {
            yPercent: -160,
            opacity: 0,
            stagger: { each: 0.012, from: 'random' },
            ease: 'power1.in',
            duration: 0.5,
          }, 0)
          .to(galaxyParams, { scatter: 1, opacity: 0.15, duration: 1, ease: 'none' }, 0)
          .to(q('.hero-kicker, .hero-scroll-hint'), { opacity: 0, duration: 0.3 }, 0.5);

        // Tutorials: dikey scroll → yatay kayma
        const track = q('.tut-track')[0] as HTMLElement;
        const panels = q('.tut-panel') as HTMLElement[];
        const getX = () => -(track.scrollWidth - window.innerWidth);
        gsap.to(track, {
          x: getX,
          ease: 'none',
          scrollTrigger: {
            trigger: q('.tut-section')[0],
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 1.2,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              const idx = Math.round(st.progress * (panels.length - 1));
              panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
            },
          },
        });

        return () => {};
      });
    }, root);

    function applyWipe() {
      const path = document.getElementById('liquid-wipe-path');
      if (path) path.setAttribute('d', wobblyCirclePath(wipeScale.value));
    }

    // ── Marquee: sonsuz şerit, hover'da yavaşlar ──
    let marqueeTick: (() => void) | null = null;
    const inner = marqueeRef.current;
    if (inner && !reduced) {
      let x = 0;
      const speedObj = { v: 1 };
      const onEnter = () => gsap.to(speedObj, { v: 0.3, duration: 0.6 });
      const onLeave = () => gsap.to(speedObj, { v: 1, duration: 0.6 });
      inner.parentElement!.addEventListener('mouseenter', onEnter);
      inner.parentElement!.addEventListener('mouseleave', onLeave);
      marqueeTick = () => {
        const half = inner.scrollWidth / 2;
        if (!half) return;
        // 40s'de yarım genişlik
        x -= (half / (40 * 60)) * speedObj.v * gsap.ticker.deltaRatio(60);
        if (x <= -half) x += half;
        inner.style.transform = `translateX(${x}px)`;
      };
      gsap.ticker.add(marqueeTick);
    }

    // ── Work hover preview: imleci lerp 0.08 ile takip eden kart ──
    let previewTickFn: (() => void) | null = null;
    const preview = previewRef.current;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (preview && fine && !reduced) {
      const pos = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => {
        target.x = e.clientX;
        target.y = e.clientY;
      };
      window.addEventListener('mousemove', onMove, { passive: true });
      previewTickFn = () => {
        pos.x += (target.x - pos.x) * 0.08;
        pos.y += (target.y - pos.y) * 0.08;
        // imlecin 24px sağ-altı; yalnızca transform (compositor-only)
        preview.style.transform = `translate3d(${pos.x + 24}px, ${pos.y + 24}px, 0)`;
      };
      gsap.ticker.add(previewTickFn);
      const cleanupMove = () => window.removeEventListener('mousemove', onMove);
      (preview as any).__cleanup = cleanupMove;
    }

    return () => {
      ctx.revert();
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
      if (marqueeTick) gsap.ticker.remove(marqueeTick);
      if (previewTickFn) gsap.ticker.remove(previewTickFn);
      (previewRef.current as any)?.__cleanup?.();
    };
  }, []);

  const showPreview = (idx: number | null) => {
    const el = previewRef.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (idx !== null) {
      setPreviewIdx(idx);
      if (inner) gsap.to(inner, { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' });
    } else if (inner) {
      gsap.to(inner, { scale: 0, opacity: 0, duration: 0.35, ease: 'power3.in' });
    }
  };

  return (
    <div ref={root}>
      <LiquidBackground />
      <CustomCursor />

      {/* Liquid wipe maskesi */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <clipPath id="liquid-wipe" clipPathUnits="objectBoundingBox">
            <path id="liquid-wipe-path" d={wobblyCirclePath(0.0001)} />
          </clipPath>
        </defs>
      </svg>

      {/* ── HERO — pinned ── */}
      <section className="hero-section relative min-h-screen overflow-hidden">
        {/* Galaksi ismin ARKASINDA, sağda — başlık asla örtülmez */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <GalaxyObject params={galaxyParams} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 text-center">
          <p className="hero-kicker eyebrow mb-8">
            AI Engineer · Researcher · Content Producer
          </p>
          <h1
            className="font-display font-medium text-ink-primary leading-[0.95] tracking-[-0.01em]"
            style={{ fontSize: 'clamp(96px, 14vw, 200px)' }}
          >
            <span className="hero-line block overflow-hidden">
              <span className="hero-line-inner block">
                <Chars text="Samet" />
              </span>
            </span>
            <span className="hero-line block overflow-hidden">
              <span className="hero-line-inner block italic text-accent">
                <Chars text="Akın" />
              </span>
            </span>
          </h1>

          <div className="hero-scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="eyebrow">Scroll</span>
            <span className="block w-px h-10 bg-line-sub" aria-hidden />
          </div>
        </div>
      </section>

      {/* ── STATEMENT — liquid wipe ── */}
      <section className="stmt-section min-h-screen flex items-center justify-center px-5">
        <div style={{ clipPath: 'url(#liquid-wipe)' }}>
          <h2
            className="font-display text-ink-primary text-center leading-[1.1] max-w-5xl"
            style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}
          >
            {'I build systems that think before they speak.'.split(' ').map((w, i) => (
              <span key={i} className="inline-block overflow-hidden align-top mr-[0.28em]">
                <span
                  className={`stmt-word-inner inline-block ${w === 'think' ? 'italic text-accent' : ''}`}
                >
                  {w}
                </span>
              </span>
            ))}
          </h2>
        </div>
      </section>

      {/* ── SELECTED WORK ── */}
      <section id="work" className="mx-auto max-w-6xl px-5 py-24 md:py-32 relative">
        <div className="mb-14">
          <p className="eyebrow mb-3">Work</p>
          <h2 className="font-display text-3xl md:text-5xl text-ink-primary">Selected work</h2>
        </div>

        <ol onMouseLeave={() => showPreview(null)}>
          {projects.map((p, i) => (
            <li key={p.id} className="reveal-row border-t border-line-hair last:border-b">
              <article
                data-cursor="VIEW"
                onMouseEnter={() => showPreview(i)}
                className="group grid md:grid-cols-[140px_1fr_auto] gap-6 items-baseline py-8 md:py-12 px-2 -mx-2 hover:bg-bg-surface/60 transition-colors duration-[400ms]"
              >
                <span
                  className="num-outline font-display leading-none"
                  style={{ fontSize: 'clamp(48px, 6vw, 96px)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-2xl md:text-4xl text-ink-primary group-hover:text-accent transition-colors duration-300">
                    {p.title}
                  </h3>
                  <p className="text-sm text-ink-secondary max-w-xl mt-2 leading-[1.7]">
                    {p.summary}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="hidden md:block font-mono text-ink-tertiary group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-300"
                >
                  →
                </span>
              </article>
            </li>
          ))}
        </ol>

        {/* İmleci takip eden preview kartı — dış katman konum (translate3d),
            iç katman scale; cursor halkası (z-100) her zaman kartın üstünde */}
        <div
          ref={previewRef}
          aria-hidden
          className="fixed top-0 left-0 z-40 pointer-events-none will-change-transform"
        >
          <div
            className="w-[240px] h-[150px] rounded-[2px] border border-line-hair overflow-hidden relative opacity-0 scale-0 origin-top-left"
            style={{ backgroundColor: '#08111F' }}
          >
            <div className="absolute inset-0 blur-2xl">
              <span
                className="preview-blob-a absolute w-[130px] h-[130px] rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${projects[previewIdx].gradient[0]} 0%, transparent 60%)`,
                }}
              />
              <span
                className="preview-blob-b absolute w-[130px] h-[130px] rounded-full"
                style={{
                  background: `radial-gradient(circle at 70% 70%, ${projects[previewIdx].gradient[1]} 0%, transparent 55%)`,
                }}
              />
            </div>
            <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.25em] text-[#F2EBDD]/70">
              {String(previewIdx + 1).padStart(2, '0')} — Project
            </span>
          </div>
        </div>
      </section>

      {/* ── TUTORIALS — horizontal scroll ── */}
      <section className="tut-section relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pt-24 md:pt-28 md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2 md:w-full z-10">
          <p className="eyebrow mb-3">Tutorials</p>
        </div>
        <div className="tut-track flex flex-col md:flex-row md:h-screen md:items-center gap-16 md:gap-0 py-16 md:py-0 will-change-transform">
          {playlistPanels.map(({ meta, data }) => (
            <div key={meta.id} className="tut-panel shrink-0 w-full md:w-[70vw] px-5 md:px-16">
              <a
                href={data!.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block max-w-3xl mx-auto"
                data-cursor="PLAY"
              >
                <div className="tut-thumb aspect-video relative overflow-hidden rounded-[2px] bg-bg-elevated isolate">
                  {data!.latestVideo && (
                    <YouTubeThumbnail
                      videoId={data!.latestVideo.id}
                      title={data!.latestVideo.title}
                    />
                  )}
                </div>
                <p className="eyebrow mt-6 mb-3">
                  Series · {meta.manualVideoCount ?? data!.videoCount} videos
                </p>
                <h3
                  className="font-display text-ink-primary group-hover:text-accent transition-colors duration-300"
                  style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
                >
                  {meta.title}
                </h3>
                <p className="text-sm text-ink-secondary leading-[1.7] mt-2 max-w-lg">
                  {meta.description}
                </p>
                {data!.latestVideo && (
                  <div className="mt-5 pt-4 border-t border-line-hair flex items-baseline gap-4 font-mono text-[11px]">
                    <span className="uppercase tracking-[0.25em] text-warm shrink-0">Latest</span>
                    <span className="text-ink-secondary truncate">{data!.latestVideo.title}</span>
                  </div>
                )}
              </a>
            </div>
          ))}
          {/* CTA paneli */}
          <div className="tut-panel shrink-0 w-full md:w-[70vw] px-5 md:px-16 flex items-center">
            <a
              href="/videos"
              data-cursor="GO"
              className="group block mx-auto text-center"
            >
              <span
                className="font-display text-ink-primary group-hover:text-accent transition-colors duration-300 block"
                style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}
              >
                All videos <span aria-hidden>→</span>
              </span>
              <span className="eyebrow mt-4 block">Everything on the channel</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── WRITING ── */}
      <section id="writing" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <div className="mb-14">
          <p className="eyebrow mb-3">Writing</p>
          <h2 className="font-display text-3xl md:text-5xl text-ink-primary">A few notes</h2>
        </div>
        <div>
          {writingDrafts.map((d) => (
            <a
              key={d.href}
              href={d.href}
              data-cursor="READ"
              className="reveal-row group grid md:grid-cols-[120px_1fr_auto] gap-6 items-baseline border-t border-line-hair last:border-b py-8 md:py-10 px-2 -mx-2 hover:bg-bg-surface/60 transition-colors duration-[400ms]"
            >
              <span className="font-mono text-xs text-ink-tertiary whitespace-nowrap">
                {d.reading}
              </span>
              <div>
                <h3 className="font-display text-2xl md:text-3xl text-ink-primary group-hover:text-accent transition-colors duration-300">
                  {d.title}
                </h3>
                <p className="text-sm text-ink-secondary max-w-xl mt-2 leading-[1.7]">{d.desc}</p>
              </div>
              <span
                aria-hidden
                className="hidden md:block font-mono text-ink-tertiary group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-300"
              >
                →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── CONTACT — final ── */}
      <section id="contact" className="min-h-screen flex flex-col justify-between">
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <p className="eyebrow mb-10">Collaboration · Research · A talk about a model</p>
          <a
            href="mailto:sametakin44@gmail.com"
            data-cursor="SAY HI"
            className="lets-talk font-display leading-none"
            style={{ fontSize: 'clamp(64px, 10vw, 160px)' }}
          >
            Let's <span className="italic">talk</span>
          </a>

          <ul className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4 font-mono text-[11px] uppercase tracking-[0.25em]">
            {contactChannels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-ink-tertiary hover:text-accent transition-colors duration-300"
                >
                  {c.label} <span aria-hidden>→</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="font-mono text-xs text-ink-tertiary mt-20">
            &copy; 2026 Samet Akın · building things <span className="opacity-60">&#x1F989;</span>
          </p>
        </div>

        {/* Sonsuz marquee */}
        <div className="border-t border-line-hair py-6 overflow-hidden select-none">
          <div ref={marqueeRef} className="flex whitespace-nowrap will-change-transform">
            {[0, 1].map((k) => (
              <span
                key={k}
                className="font-display italic text-3xl md:text-5xl text-ink-primary/30 shrink-0"
              >
                {'AI Engineer — Researcher — Content Producer — '.repeat(3)}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
