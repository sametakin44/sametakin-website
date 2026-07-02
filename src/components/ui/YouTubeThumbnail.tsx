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
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-bg-elevated border border-line-hair ${className}`}
      >
        <div className="px-6 py-4 text-center">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-ink-tertiary mb-2">
            video
          </div>
          <div className="text-sm font-medium text-ink-secondary line-clamp-3">
            {title}
          </div>
        </div>
      </div>
    );
  }

  if (!src) {
    return <div className={`w-full h-full bg-bg-elevated ${className}`} />;
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
