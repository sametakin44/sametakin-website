import { XMLParser } from 'fast-xml-parser';

export interface YouTubeThumbnailSet {
  high: string;
  medium: string;
  low: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: YouTubeThumbnailSet;
  link: string;
}

export interface PlaylistVideo {
  id: string;
  title: string;
  published: string;
  publishedDate: Date;
  thumbnail: string;
  thumbnailFallback: string;
  link: string;
  verifiedThumbnail?: string | null;
  hasThumbnail?: boolean;
}

export interface PlaylistData {
  id: string;
  title: string;
  author?: string;
  videos: PlaylistVideo[];
  videoCount: number;
  latestVideo: PlaylistVideo | null;
  playlistUrl: string;
}

const emptyThumb = (): YouTubeThumbnailSet => ({ high: '', medium: '', low: '' });

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'fallback-dl',
    title: 'Deep learning series · RNN, LSTM, Transformers',
    published: '2025-01-01',
    thumbnail: emptyThumb(),
    link: 'https://www.youtube.com/@sametakin44',
  },
  {
    id: 'fallback-llm',
    title: 'LLM series · fine-tuning, RAG, prompt engineering',
    published: '2025-01-01',
    thumbnail: emptyThumb(),
    link: 'https://www.youtube.com/@sametakin44',
  },
];

const thumbsFor = (videoId: string): YouTubeThumbnailSet => ({
  high: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  medium: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  low: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
});

export async function getLatestVideos(
  channelId: string,
  limit = 3,
): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    );
    if (!res.ok) return FALLBACK_VIDEOS;

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    const entries = data.feed?.entry;
    if (!entries) return FALLBACK_VIDEOS;

    const list = Array.isArray(entries) ? entries : [entries];

    return list.slice(0, limit).map((entry: any) => {
      const videoId = entry['yt:videoId'];
      return {
        id: videoId,
        title: entry.title,
        published: entry.published,
        thumbnail: thumbsFor(videoId),
        link:
          entry.link?.['@_href'] ??
          `https://www.youtube.com/watch?v=${videoId}`,
      };
    });
  } catch {
    return FALLBACK_VIDEOS;
  }
}

export async function getPlaylist(
  playlistId: string,
): Promise<PlaylistData | null> {
  const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Playlist fetch failed');
    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const data = parser.parse(xml);
    const feed = data.feed;
    if (!feed) return null;

    const rawEntries = feed.entry;
    const entries = Array.isArray(rawEntries)
      ? rawEntries
      : rawEntries
        ? [rawEntries]
        : [];

    const videos: PlaylistVideo[] = entries
      .filter(Boolean)
      .map((entry: any) => {
        const videoId = entry['yt:videoId'];
        return {
          id: videoId,
          title: entry.title,
          published: entry.published,
          publishedDate: new Date(entry.published),
          thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          thumbnailFallback: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          link: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
        };
      });

    videos.sort(
      (a, b) => b.publishedDate.getTime() - a.publishedDate.getTime(),
    );

    return {
      id: playlistId,
      title: feed.title,
      author: feed.author?.name,
      videos,
      videoCount: videos.length,
      latestVideo: videos[0] ?? null,
      playlistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
    };
  } catch (err) {
    console.error('getPlaylist error:', err);
    return null;
  }
}

// YouTube'un "bu boyut yok" fallback (gri) image'ı için yaklaşık boyut.
// HEAD content-length ile ayırt ediyoruz; tam 1097 olmayabilir, o yüzden
// "çok küçük" heuristic ile güvenle ayıkla.
const GRAY_PLACEHOLDER_MAX_BYTES = 5000;

async function pickVerifiedThumb(videoId: string): Promise<string | null> {
  const candidates = [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ];
  for (const url of candidates) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (!r.ok) continue;
      const len = Number(r.headers.get('content-length') ?? 0);
      if (!len || len > GRAY_PLACEHOLDER_MAX_BYTES) {
        return url;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export async function getPlaylistWithVerifiedThumbs(
  playlistId: string,
): Promise<PlaylistData | null> {
  const playlist = await getPlaylist(playlistId);
  if (!playlist) return null;

  const verifiedVideos: PlaylistVideo[] = await Promise.all(
    playlist.videos.map(async (v) => {
      const verified = await pickVerifiedThumb(v.id);
      return {
        ...v,
        verifiedThumbnail: verified,
        hasThumbnail: Boolean(verified),
      };
    }),
  );

  return {
    ...playlist,
    videos: verifiedVideos,
    latestVideo: verifiedVideos[0] ?? null,
  };
}
