import { XMLParser } from 'fast-xml-parser';

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  link: string;
}

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'fallback-dl',
    title: 'derin öğrenme serisi · rnn, lstm, transformers',
    published: '2025-01-01',
    thumbnail: '',
    link: 'https://www.youtube.com/@sametakin',
  },
  {
    id: 'fallback-llm',
    title: 'llm serisi · fine-tuning, rag, prompt engineering',
    published: '2025-01-01',
    thumbnail: '',
    link: 'https://www.youtube.com/@sametakin',
  },
];

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
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        link:
          entry.link?.['@_href'] ??
          `https://www.youtube.com/watch?v=${videoId}`,
      };
    });
  } catch {
    return FALLBACK_VIDEOS;
  }
}
