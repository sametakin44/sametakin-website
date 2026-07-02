// Video verisi artık build sırasında network'ten değil, repo'da commit'li
// src/data/videos.json arşivinden okunur. Arşivi scripts/update-videos.mjs
// günceller (haftalık workflow veya lokalde `npm run update-videos`).
// Thumbnail URL'leri client-side YouTubeThumbnail component'inde üretilir.

import videosData from '../data/videos.json';

export interface VideoEntry {
  id: string;
  title: string;
  published: string;
  link: string;
}

export interface PlaylistData {
  id: string;
  title: string;
  videos: VideoEntry[];
  videoCount: number;
  latestVideo: VideoEntry | null;
  playlistUrl: string;
}

const byPublishedDesc = (a: VideoEntry, b: VideoEntry) =>
  new Date(b.published).getTime() - new Date(a.published).getTime();

export function getPlaylistData(playlistId: string): PlaylistData | null {
  const playlist = (
    videosData.playlists as Record<string, { title: string; videos: VideoEntry[] }>
  )[playlistId];
  if (!playlist) return null;

  const videos = [...playlist.videos].sort(byPublishedDesc);
  return {
    id: playlistId,
    title: playlist.title,
    videos,
    videoCount: videos.length,
    latestVideo: videos[0] ?? null,
    playlistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
  };
}

export function getChannelVideos(): VideoEntry[] {
  return [...(videosData.channel.videos as VideoEntry[])].sort(byPublishedDesc);
}
