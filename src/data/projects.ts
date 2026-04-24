export type ProjectAccent = 'accent' | 'warm' | 'mint';

export interface Project {
  id: string;
  title: string;
  summary: string;
  accent: ProjectAccent;
}

export const projects: Project[] = [
  {
    id: 'finetune-pipeline',
    title: 'PDF to fine-tuning dataset pipeline',
    summary:
      'A multi-threaded system that turns PDF documents into domain-specific training data.',
    accent: 'accent',
  },
  {
    id: 'sql-agent',
    title: 'Agentic SQL chatbot',
    summary:
      'A ReAct-based conversational layer over a synthetic SQL schema.',
    accent: 'warm',
  },
  {
    id: 'legal-rag',
    title: 'Legal domain agentic RAG analysis',
    summary:
      'Reviewed a knowledge-graph-backed chatbot and proposed architectural improvements.',
    accent: 'mint',
  },
  {
    id: 'abr-research',
    title: 'ABR signal wave detection',
    summary:
      'Transformer-based models for detecting and locating the fifth latency in auditory brainstem responses.',
    accent: 'accent',
  },
  {
    id: 'multi-agent-rag',
    title: 'Multi-agent RAG system',
    summary:
      'Compared chunking strategies and built a ReAct control agent coordinating database and web-search agents.',
    accent: 'warm',
  },
  {
    id: 'vision-synthetic',
    title: 'Fruit classification with synthetic data',
    summary:
      'CNN training pipelines plus DALL-E-generated backgrounds for YOLO detection experiments.',
    accent: 'mint',
  },
];
