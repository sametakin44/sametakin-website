// gradient: hover preview kartındaki iki radial blob'un renkleri —
// hepsi marka paleti (mor / altın / fildişi / lacivert-mor).
export interface Project {
  id: string;
  title: string;
  summary: string;
  gradient: [string, string];
}

export const projects: Project[] = [
  {
    id: 'finetune-pipeline',
    title: 'PDF to fine-tuning dataset pipeline',
    summary:
      'A multi-threaded system that turns PDF documents into domain-specific training data.',
    gradient: ['#8B7FFF', '#C8A56A'],
  },
  {
    id: 'sql-agent',
    title: 'AI Development Platform',
    summary:
      'A Multi-Agent platform for training AI models autonomously.',
    gradient: ['#8B7FFF', '#F2EBDD'],
  },
  {
    id: 'legal-rag',
    title: 'Legal domain agentic RAG analysis',
    summary:
      'Reviewed a knowledge-graph-backed chatbot and proposed architectural improvements.',
    gradient: ['#C8A56A', '#26215C'],
  },
  {
    id: 'abr-research',
    title: 'ABR signal wave detection',
    summary:
      'Transformer-based models for detecting and locating the fifth latency in auditory brainstem responses.',
    gradient: ['#8B7FFF', '#C8A56A'],
  },
  {
    id: 'multi-agent-rag',
    title: 'Multi-agent RAG system',
    summary:
      'Compared chunking strategies and built a ReAct control agent coordinating database and web-search agents.',
    gradient: ['#F2EBDD', '#8B7FFF'],
  },
  {
    id: 'vision-synthetic',
    title: 'Fruit classification with synthetic data',
    summary:
      'CNN training pipelines plus DALL-E-generated backgrounds for YOLO detection experiments.',
    gradient: ['#C8A56A', '#8B7FFF'],
  },
];
