import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { KnowledgeGraph as KnowledgeGraphType } from '../types/knowledge';
import {
  convertToReactFlowNodes,
  convertToReactFlowEdges,
  ReactFlowKnowledgeNode,
  ReactFlowKnowledgeEdge,
} from '../types/reactflow';
import KnowledgeNode from './KnowledgeNode';

interface KnowledgeGraphProps {
  data: KnowledgeGraphType;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  masteredNodes: Set<string>;
}

// 定义节点类型
const nodeTypes = {
  knowledgeNode: KnowledgeNode,
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  data,
  selectedNodeId,
  onNodeClick,
  masteredNodes,
}) => {
  // 转换数据为 React Flow 格式
  const initialNodes = useMemo(() => {
    if (!data || !data.nodes) return [];
    const nodes = convertToReactFlowNodes(data.nodes, onNodeClick);
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isMastered: masteredNodes.has(node.id),
      },
    }));
  }, [data, onNodeClick, masteredNodes]);

  const initialEdges = useMemo(() => {
    if (!data || !data.edges) return [];
    return convertToReactFlowEdges(data.edges) as Edge[];
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 更新节点状态
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isMastered: masteredNodes.has(node.id),
        },
        style: {
          ...node.style,
          outline: selectedNodeId === node.id ? '3px solid #3b82f6' : 'none',
        },
      }))
    );
  }, [masteredNodes, selectedNodeId, setNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            const node = n as ReactFlowKnowledgeNode;
            switch (node.data.category) {
              case 'basic': return '#3b82f6';
              case 'advanced': return '#10b981';
              case 'practical': return '#8b5cf6';
              default: return '#6b7280';
            }
          }}
          nodeColor={(n) => {
            const node = n as ReactFlowKnowledgeNode;
            switch (node.data.category) {
              case 'basic': return '#dbeafe';
              case 'advanced': return '#dcfce7';
              case 'practical': return '#f3e8ff';
              default: return '#f3f4f6';
            }
          }}
          nodeBorderRadius={8}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;
