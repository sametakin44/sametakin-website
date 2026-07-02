// YouTube RSS feed'lerinden src/data/videos.json arşivini günceller.
// Merge mantığı: yeni videolar eklenir, mevcut kayıtlar ASLA silinmez.
// Herhangi bir feed fail olursa o bölüm dokunulmadan bırakılır, exit 0.
// Stdout: "CHANGED" | "UNCHANGED" (workflow commit adımı buna bakar).

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const DATA_PATH = fileURLToPath(
  new URL('../src/data/videos.json', import.meta.url),
);

const FETCH_TIMEOUT_MS = 10_000;

async function fetchFeedVideos(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const feed = parser.parse(xml)?.feed;
  if (!feed) throw new Error(`No <feed> in response for ${url}`);

  const raw = feed.entry;
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return entries.filter(Boolean).map((entry) => {
    const videoId = entry['yt:videoId'];
    return {
      id: videoId,
      title: String(entry.title),
      published: entry.published,
      link: entry.link?.['@_href'] ?? `https://www.youtube.com/watch?v=${videoId}`,
    };
  });
}

// Mevcut listeyle birleştir: id bazında dedupe (yeni gelen kaydı tercih et,
// başlık düzeltmeleri yansısın), eskiler korunur, published DESC.
function mergeVideos(existing, incoming) {
  const byId = new Map();
  for (const v of existing) byId.set(v.id, v);
  for (const v of incoming) byId.set(v.id, v);
  return [...byId.values()].sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
  );
}

const data = JSON.parse(await readFile(DATA_PATH, 'utf8'));
let changed = false;

async function updateSection(label, url, getList, setList) {
  let incoming;
  try {
    incoming = await fetchFeedVideos(url);
  } catch (err) {
    console.error(`[skip] ${label}: ${err.message}`);
    return;
  }
  const before = getList();
  const merged = mergeVideos(before, incoming);
  if (JSON.stringify(merged) !== JSON.stringify(before)) {
    setList(merged);
    changed = true;
    console.error(`[updated] ${label}: ${before.length} → ${merged.length} videos`);
  }
}

await updateSection(
  `channel ${data.channel.id}`,
  `https://www.youtube.com/feeds/videos.xml?channel_id=${data.channel.id}`,
  () => data.channel.videos,
  (v) => (data.channel.videos = v),
);

for (const [playlistId, playlist] of Object.entries(data.playlists)) {
  await updateSection(
    `playlist ${playlist.title}`,
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`,
    () => playlist.videos,
    (v) => (playlist.videos = v),
  );
}

if (changed) {
  data.lastUpdated = new Date().toISOString();
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('CHANGED');
} else {
  console.log('UNCHANGED');
}
