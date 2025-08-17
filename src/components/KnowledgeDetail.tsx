'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KnowledgeNode } from '../types/knowledge';
import { knowledgeGraph } from '../data/knowledgeData';

interface KnowledgeDetailProps {
  nodeId: string | null;
  onClose: () => void;
  onStartQuiz?: (nodeId: string) => void;
}

export default function KnowledgeDetail({ nodeId, onClose, onStartQuiz }: KnowledgeDetailProps) {
  if (!nodeId) return null;

  const node = knowledgeGraph.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'advanced':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'practical':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPrerequisites = () => {
    return node.prerequisites.map(prereqId => {
      const prereqNode = knowledgeGraph.nodes.find(n => n.id === prereqId);
      return prereqNode ? prereqNode.title : prereqId;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{node.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(node.category)}`}>
              {node.category}
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">
              Level {node.level}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-600 text-lg">{node.description}</p>
          </div>

          {/* Prerequisites */}
          {node.prerequisites.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">前置知识</h3>
              <div className="flex flex-wrap gap-2">
                {getPrerequisites().map((prereq, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">详细内容</h3>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    return isInline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  h1: ({ children }: any) => (
                    <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>
                  ),
                  h2: ({ children }: any) => (
                    <h2 className="text-xl font-bold mb-3 text-gray-900">{children}</h2>
                  ),
                  h3: ({ children }: any) => (
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">{children}</h3>
                  ),
                  p: ({ children }: any) => (
                    <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }: any) => (
                    <ul className="list-disc list-inside mb-4 text-gray-700">{children}</ul>
                  ),
                  li: ({ children }: any) => (
                    <li className="mb-1">{children}</li>
                  ),
                }}
              >
                {node.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Examples */}
          {node.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">代码示例</h3>
              <div className="space-y-4">
                {node.examples.map((example, index) => (
                  <div key={index} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      <code>{example}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              完成这个知识点后，可以继续学习相关的进阶内容
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                关闭
              </button>
              {onStartQuiz && (
                <button
                  onClick={() => onStartQuiz(nodeId)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  开始测试
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
