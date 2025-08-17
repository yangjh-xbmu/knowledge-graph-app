import { Node, Edge } from 'reactflow';
import { KnowledgeNode, KnowledgeEdge } from './knowledge';

// React Flow 节点类型
export interface ReactFlowKnowledgeNode extends Node {
  data: {
    id: string;
    title: string;
    description: string;
    category: 'basic' | 'advanced' | 'practical';
    level: number;
    prerequisites: string[];
    content: string;
    examples: string[];
    isMastered?: boolean;
    masteredAt?: Date;
    onClick?: (nodeId: string) => void;
  };
}

// React Flow 边类型
export type ReactFlowKnowledgeEdge = Edge & {
  data?: {
    type: 'prerequisite' | 'related' | 'extends';
    label?: string;
  };
}

// 数据转换函数
export const convertToReactFlowNodes = (
  nodes: KnowledgeNode[],
  onNodeClick?: (nodeId: string) => void
): ReactFlowKnowledgeNode[] => {
  return nodes.map((node) => ({
    id: node.id,
    type: 'knowledgeNode',
    position: node.position,
    data: {
      ...node,
      onClick: onNodeClick,
    },
  }));
};

export const convertToReactFlowEdges = (
  edges: KnowledgeEdge[]
): Edge[] => {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type === 'prerequisite' ? 'smoothstep' : 'default',
    animated: edge.type === 'prerequisite',
    style: {
      stroke: getEdgeColor(edge.type),
      strokeWidth: edge.type === 'prerequisite' ? 3 : 2,
    },
    label: edge.label,
  } as Edge));
};

// 根据边类型获取颜色
const getEdgeColor = (type: 'prerequisite' | 'related' | 'extends'): string => {
  switch (type) {
    case 'prerequisite':
      return '#3b82f6'; // 蓝色
    case 'related':
      return '#10b981'; // 绿色
    case 'extends':
      return '#f59e0b'; // 橙色
    default:
      return '#6b7280'; // 灰色
  }
};

// 节点样式配置
export const getNodeStyle = (category: 'basic' | 'advanced' | 'practical') => {
  const baseStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '200px',
    textAlign: 'center' as const,
  };

  switch (category) {
    case 'basic':
      return {
        ...baseStyle,
        backgroundColor: '#dbeafe',
        borderColor: '#3b82f6',
        color: '#1e40af',
      };
    case 'advanced':
      return {
        ...baseStyle,
        backgroundColor: '#dcfce7',
        borderColor: '#10b981',
        color: '#047857',
      };
    case 'practical':
      return {
        ...baseStyle,
        backgroundColor: '#f3e8ff',
        borderColor: '#8b5cf6',
        color: '#6d28d9',
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: '#f3f4f6',
        borderColor: '#6b7280',
        color: '#374151',
      };
  }
};