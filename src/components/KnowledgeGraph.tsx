'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { knowledgeGraph } from '../data/knowledgeData';
import { KnowledgeNode as KnowledgeNodeType } from '../types/knowledge';
import { masteryService } from '../services/masteryService';

// 自定义节点组件
const KnowledgeNode = React.memo(({ data }: { data: KnowledgeNodeType }) => {
  const isMastered = masteryService.isMastered(data.id);
  const masteryState = masteryService.getMasteryState(data.id);

  const getCategoryColor = (category: string, mastered: boolean) => {
    if (mastered) {
      // 已掌握的知识点使用金色主题
      return 'bg-yellow-50 border-yellow-400 text-yellow-900 shadow-yellow-200';
    }
    
    switch (category) {
      case 'basic':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'advanced':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'practical':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getLevelBadge = (level: number) => {
    return (
      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
        {level}
      </span>
    );
  };

  const getMasteryBadge = () => {
    if (!isMastered || !masteryState) return null;
    
    const scoreText = masteryState.quizScore ? `${masteryState.quizScore.toFixed(0)}%` : '已掌握';
    return (
      <span className="absolute -top-2 -left-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold" title={`已掌握 (${scoreText})`}>
        ✓
      </span>
    );
  };

  const borderStyle = isMastered ? 'border-3 border-yellow-400 shadow-lg' : 'border-2';

  return (
    <div className={`relative px-4 py-3 rounded-lg ${borderStyle} shadow-md min-w-[200px] max-w-[250px] ${getCategoryColor(data.category, isMastered)}`}>
      {/* React Flow Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#555' }}
      />
      
      {getLevelBadge(data.level)}
      {getMasteryBadge()}
      <div className="font-bold text-sm mb-1">{data.title}</div>
      <div className="text-xs opacity-80">{data.description}</div>
      <div className="mt-2 text-xs flex justify-between items-center">
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          isMastered 
            ? 'bg-yellow-200 text-yellow-800 border border-yellow-300'
            : data.category === 'basic' 
              ? 'bg-blue-200 text-blue-800 border border-blue-300'
              : data.category === 'advanced'
                ? 'bg-green-200 text-green-800 border border-green-300'
                : data.category === 'practical'
                  ? 'bg-purple-200 text-purple-800 border border-purple-300'
                  : 'bg-gray-200 text-gray-800 border border-gray-300'
        }`}>
          {data.category}
        </span>
        {isMastered && masteryState && masteryState.quizScore && (
          <span className="text-green-600 font-semibold text-xs">
            {masteryState.quizScore.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
});

// 节点类型定义 - 定义在组件外部避免重新创建
const nodeTypes = {
  knowledgeNode: KnowledgeNode,
};

interface KnowledgeGraphProps {
  onNodeClick?: (nodeId: string) => void;
}

export default function KnowledgeGraph({ onNodeClick }: KnowledgeGraphProps) {
  // 转换数据格式为 ReactFlow 需要的格式
  const initialNodes: Node[] = useMemo(() => {
    return knowledgeGraph.nodes.map((node) => ({
      id: node.id,
      type: 'knowledgeNode',
      position: node.position,
      data: node,
      draggable: true,
    }));
  }, []);

  const initialEdges: Edge[] = useMemo(() => {
    return knowledgeGraph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep',
      animated: edge.type === 'prerequisite',
      style: {
        stroke: edge.type === 'prerequisite' ? '#3b82f6' : '#6b7280',
        strokeWidth: edge.type === 'prerequisite' ? 2 : 1,
      },
      label: edge.label,
      labelStyle: {
        fontSize: 12,
        fontWeight: 600,
      },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls className="bg-white shadow-lg" />
        <MiniMap
          className="bg-white shadow-lg"
          nodeColor={(node) => {
            const data = node.data as KnowledgeNodeType;
            switch (data.category) {
              case 'basic':
                return '#3b82f6';
              case 'advanced':
                return '#10b981';
              case 'practical':
                return '#8b5cf6';
              default:
                return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
