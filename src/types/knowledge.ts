export interface KnowledgeNode {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'advanced' | 'practical';
  level: number;
  prerequisites: string[];
  content: string;
  examples: string[];
  position: { x: number; y: number };
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'prerequisite' | 'related' | 'extends';
  label?: string;
}

export interface Quiz {
  id: string;
  nodeId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}