import { useEffect, useState } from 'react';

interface Props {
  videoId: string;
  title: string;
  className?: string;
  verifiedUrl?: string | null;
  hasThumbnail?: boolean;
}

const GRAY_PLACEHOLDER_SIZES = [
  { w: 120, h: 90 },
];

function probe(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const isPlaceholder = GRAY_PLACEHOLDER_SIZES.some(
        (s) => img.naturalWidth === s.w && img.naturalHeight === s.h,
      );
      resolve(!isPlaceholder && img.naturalWidth > 120);
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export default function YouTubeThumbnail({
  videoId,
  title,
  className = '',
  verifiedUrl,
  hasThumbnail,
}: Props) {
  const initialSrc = verifiedUrl ?? null;
  const initialFailed = hasThumbnail === false;

  const [src, setSrc] = useState<string | null>(initialSrc);
  const [failed, setFailed] = useState<boolean>(initialFailed);

  useEffect(() => {
    if (initialSrc || initialFailed) return;
    let cancelled = false;
    const urls = [
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    ];
    (async () => {
      for (const url of urls) {
        const ok = await probe(url);
        if (cancelled) return;
        if (ok) {
          setSrc(url);
          return;
        }
      }
      if (!cancelled) setFailed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId, initialSrc, initialFailed]);

  if (failed) {
    const hash = videoId
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hue = (hash * 37) % 360;
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${className}`}
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 45%, 22%) 0%, hsl(${(hue + 40) % 360}, 50%, 14%) 100%)`,
        }}
      >
        <div className="px-6 py-4 text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 mb-2">
            video
          </div>
          <div className="text-sm font-medium text-white/90 line-clamp-3">
            {title}
          </div>
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-bg-elevated to-bg-surface animate-pulse ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={title}
      loading="lazy"
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
