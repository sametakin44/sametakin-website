export interface TutorialPlaylist {
  id: string;
  title: string;
  description: string;
  manualVideoCount: number | null;
}

export const tutorialPlaylists: TutorialPlaylist[] = [
  {
    id: 'PLTIZB3n0fVV17MYZz38gueiEePWbX6w3x',
    title: 'Large Language Models',
    description: 'Foundational concepts, fine-tuning, RAG, and prompt engineering.',
    manualVideoCount: null,
  },
  {
    id: 'PLTIZB3n0fVV00hRu53TOUhdKcoSGWJgf9',
    title: 'Deep Learning',
    description: 'Neural networks, RNNs, LSTMs, and transformers.',
    manualVideoCount: null,
  },
];
