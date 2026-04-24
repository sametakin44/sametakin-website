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
  thumbnail: string;
  thumbnailFallback: string;
  link: string;
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
          thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          thumbnailFallback: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          link: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
        };
      });

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
