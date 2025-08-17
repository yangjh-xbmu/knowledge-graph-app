import React from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeStyle } from '../types/reactflow';

interface KnowledgeNodeProps {
  data: {
    id: string;
    title: string;
    description: string;
    category: 'basic' | 'advanced' | 'practical';
    level: number;
    isMastered?: boolean;
    onClick?: (nodeId: string) => void;
  };
}

const KnowledgeNode: React.FC<KnowledgeNodeProps> = ({ data }) => {
  const nodeStyle = getNodeStyle(data.category);
  
  const handleClick = () => {
    if (data.onClick) {
      data.onClick(data.id);
    }
  };

  return (
    <div
      style={{
        ...nodeStyle,
        opacity: data.isMastered ? 0.8 : 1,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: data.isMastered 
          ? '0 4px 12px rgba(34, 197, 94, 0.3)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transform: 'scale(1)',
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={handleClick}
      className="hover:shadow-xl hover:scale-105 transition-all duration-200 select-none"
    >
      {/* 连接点样式优化 */}
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: '#6b7280',
          border: '2px solid white',
          width: '8px',
          height: '8px',
        }}
      />
      
      <div className="flex flex-col items-center relative">
        <div className="font-semibold text-sm mb-1 text-center leading-tight">
          {data.title}
        </div>
        <div className="text-xs opacity-75 text-center px-2 leading-relaxed">
          {data.description}
        </div>
        
        {/* 已掌握标记 */}
        {data.isMastered && (
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}
        
        {/* 等级标记 */}
        <div className="absolute -bottom-3 -left-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-300">
          <span className="text-gray-700 text-xs font-bold">{data.level}</span>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: '#6b7280',
          border: '2px solid white',
          width: '8px',
          height: '8px',
        }}
      />
    </div>
  );
};

export default KnowledgeNode;