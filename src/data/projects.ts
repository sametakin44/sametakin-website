export interface Project {
  id: string;
  title: string;
  summary: string;
}

export const projects: Project[] = [
  {
    id: 'finetune-pipeline',
    title: 'PDF to fine-tuning dataset pipeline',
    summary:
      'A multi-threaded system that turns PDF documents into domain-specific training data.',
  },
  {
    id: 'sql-agent',
    title: 'AI Development Platform',
    summary:
      'A Multi-Agent platform for training AI models autonomously.',
  },
  {
    id: 'legal-rag',
    title: 'Legal domain agentic RAG analysis',
    summary:
      'Reviewed a knowledge-graph-backed chatbot and proposed architectural improvements.',
  },
  {
    id: 'abr-research',
    title: 'ABR signal wave detection',
    summary:
      'Transformer-based models for detecting and locating the fifth latency in auditory brainstem responses.',
  },
  {
    id: 'multi-agent-rag',
    title: 'Multi-agent RAG system',
    summary:
      'Compared chunking strategies and built a ReAct control agent coordinating database and web-search agents.',
  },
  {
    id: 'vision-synthetic',
    title: 'Fruit classification with synthetic data',
    summary:
      'CNN training pipelines plus DALL-E-generated backgrounds for YOLO detection experiments.',
  },
];
