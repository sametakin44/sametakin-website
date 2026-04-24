export type PlaylistAccent = 'accent' | 'warm' | 'mint';

export interface TutorialPlaylist {
  id: string;
  title: string;
  description: string;
  accent: PlaylistAccent;
  manualVideoCount: number | null;
}

export const tutorialPlaylists: TutorialPlaylist[] = [
  {
    id: 'PLTIZB3n0fVV17MYZz38gueiEePWbX6w3x',
    title: 'Large Language Models',
    description: 'Foundational concepts, fine-tuning, RAG, and prompt engineering.',
    accent: 'accent',
    manualVideoCount: null,
  },
  {
    id: 'PLTIZB3n0fVV00hRu53TOUhdKcoSGWJgf9',
    title: 'Deep Learning',
    description: 'Neural networks, RNNs, LSTMs, and transformers.',
    accent: 'warm',
    manualVideoCount: null,
  },
];
