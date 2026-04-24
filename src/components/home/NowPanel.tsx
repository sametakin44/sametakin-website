import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { YouTubeVideo } from '../../lib/youtube';

interface Props {
  videos: YouTubeVideo[];
}

/* ── Havelsan terminal lines ── */
const terminalLines = [
  { text: '$ havelsan/main — generative ai intern', color: '' },
  { text: '─────────────────────────────────────', color: 'text-line-em' },
  { text: '[ok]  pdf → fine-tuning dataset pipeline', color: 'text-mint' },
  { text: '[ok]  multi-threaded, fastapi + gradio', color: 'text-mint' },
  { text: '[..]  benchmarking turkish llms…', color: 'text-warm' },
  { text: '[i]   led technical discussions w/ team', color: 'text-accent' },
];

/* ── ABR wave SVG path ── */
const abrPath =
  'M 10,70 Q 25,70 35,55 Q 42,45 48,55 Q 55,70 65,70 Q 72,70 80,48 Q 86,38 92,50 Q 100,70 110,70 Q 118,70 128,35 Q 134,22 140,42 Q 148,70 155,73 Q 162,73 172,28 Q 178,15 184,40 Q 190,58 195,58 Q 200,58 210,12 Q 216,2 222,30 Q 232,85 242,92 Q 255,92 272,75 L 290,72';

const abrPeaks = [
  { x: 35, y: 38, label: 'I' },
  { x: 80, y: 28, label: 'II' },
  { x: 128, y: 12, label: 'III' },
  { x: 172, y: 8, label: 'IV' },
  { x: 210, y: -6, label: 'V' },
];

/* ── Slide transition ── */
const slideVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
const slideTrans = { duration: 0.4, ease: 'easeOut' as const };

/* ── Main component ── */
export default function NowPanel({ videos }: Props) {
  const [active, setActive] = useState(0);
  const [lines, setLines] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % 3), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (active !== 0) return;
    setLines(0);
    const timers = terminalLines.map((_, i) =>
      setTimeout(() => setLines(i + 1), (i + 1) * 400),
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const video = videos[0] ?? null;

  const fmtDate = (d: string) => {
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  return (
    <div className="rounded-2xl border border-line-sub bg-bg-surface/60 p-6 h-[420px] relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-ink-tertiary">şu an</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                i === active ? 'bg-accent' : 'bg-line-em'
              }`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {active === 0 && <HaverslanSlide key="h" lines={lines} />}
          {active === 1 && (
            <YouTubeSlide key="y" video={video} fmtDate={fmtDate} />
          )}
          {active === 2 && <ABRSlide key="a" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HaverslanSlide({ lines }: { lines: number }) {
  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTrans}
      className="absolute inset-0 flex flex-col"
    >
      <div className="flex-1 rounded-lg bg-bg-base p-4 font-mono text-xs overflow-hidden">
        <div className="flex gap-1.5 mb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="space-y-1 text-ink-secondary leading-relaxed">
          {terminalLines.slice(0, lines).map((l, i) => (
            <div key={i} className={l.color}>
              {l.text}
            </div>
          ))}
          <span className="animate-pulse text-accent">▌</span>
        </div>
      </div>
      <p className="text-xs text-ink-tertiary mt-3">
        havelsan main ai center · ankara · 2025
      </p>
    </motion.div>
  );
}

function YouTubeSlide({
  video,
  fmtDate,
}: {
  video: YouTubeVideo | null;
  fmtDate: (d: string) => string;
}) {
  const fallbackTitle =
    Math.random() > 0.5
      ? 'derin öğrenme serisi · rnn, lstm, transformers'
      : 'llm serisi · fine-tuning, rag, prompt engineering';

  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTrans}
      className="absolute inset-0 flex flex-col"
    >
      <p className="font-mono text-xs text-ink-tertiary mb-3">
        son video · youtube
      </p>

      {video && video.thumbnail ? (
        <a
          href={video.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col group"
        >
          <div className="relative aspect-video rounded-lg overflow-hidden bg-bg-elevated">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-accent/0 group-hover:bg-accent/70 transition-colors duration-200">
              <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ▶
              </span>
            </div>
          </div>
          <h3 className="text-sm text-ink-primary mt-3 line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <p className="text-xs text-ink-tertiary mt-1">
            {fmtDate(video.published)}
          </p>
        </a>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-sm text-ink-primary">{fallbackTitle}</h3>
          <p className="text-xs text-ink-tertiary mt-2">youtube · teknik seri</p>
        </div>
      )}
    </motion.div>
  );
}

function ABRSlide() {
  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTrans}
      className="absolute inset-0 flex flex-col"
    >
      <p className="font-mono text-xs text-ink-tertiary mb-3">
        araştırma · tübitak 1001
      </p>
      <div className="flex-1 flex items-center justify-center px-2">
        <svg viewBox="0 0 300 100" className="w-full max-w-[300px]">
          <motion.path
            d={abrPath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
          {abrPeaks.map((p) => (
            <motion.text
              key={p.label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              fill="var(--text-tertiary)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.3 }}
            >
              {p.label}
            </motion.text>
          ))}
          <motion.circle
            cx={210}
            cy={12}
            r={3.5}
            fill="var(--accent)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.3 }}
          />
        </svg>
      </div>
      <div className="space-y-1 mt-3">
        <p className="text-xs text-ink-secondary leading-relaxed">
          abr sinyallerinde dalga tespiti ve frekans-özgü işitme eşiği tahmini
        </p>
        <p className="text-xs text-ink-tertiary">
          mentör: prof. dr. bahadır kürşat güntürk · medipol
        </p>
      </div>
    </motion.div>
  );
}
