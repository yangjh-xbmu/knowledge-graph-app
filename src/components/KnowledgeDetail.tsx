import React from 'react';
import { knowledgeGraph } from '../data/knowledgeData';
import QuizMarkdownRenderer from './QuizMarkdownRenderer';

interface KnowledgeDetailProps {
  nodeId: string | null;
  onClose: () => void;
  onStartQuiz: (nodeId: string) => void;
}

const KnowledgeDetail: React.FC<KnowledgeDetailProps> = ({ nodeId, onClose, onStartQuiz }) => {
  if (!nodeId) return null;

  const node = knowledgeGraph.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-500';
      case 'advanced':
        return 'bg-green-500';
      case 'practical':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'basic':
        return '核心基础';
      case 'advanced':
        return '进阶核心';
      case 'practical':
        return '高级与实践';
      default:
        return '未知';
    }
  };

  const prerequisites = node.prerequisites.map(id => 
    knowledgeGraph.nodes.find(n => n.id === id)
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getCategoryColor(node.category)}`}>
              {getCategoryName(node.category)} - L{node.level}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{node.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {/* Description */}
          <p className="text-gray-600 mb-6">{node.description}</p>

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">前置知识</h3>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map(prereq => prereq && (
                  <span
                    key={prereq.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {prereq.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">详细内容</h3>
            <div className="prose max-w-none">
              <QuizMarkdownRenderer content={node.content} />
            </div>
          </div>

          {/* Examples */}
          {node.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">代码示例</h3>
              <div className="space-y-4">
                {node.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <QuizMarkdownRenderer content={`\`\`\`typescript\n${example}\n\`\`\``} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500 mb-4">
            选择测验模式来检验你的理解程度
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              关闭
            </button>
            <button
                  onClick={() => onStartQuiz(node.id)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  开始测验
                </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDetail;
