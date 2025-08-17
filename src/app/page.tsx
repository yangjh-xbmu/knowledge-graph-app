'use client';

import React, { useState } from 'react';
import KnowledgeGraph from '../components/KnowledgeGraph';
import KnowledgeDetail from '../components/KnowledgeDetail';
import QuizModal from '../components/QuizModal';
import { knowledgeGraph } from '../data/knowledgeData';

export default function Home() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [quizNodeId, setQuizNodeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleCloseDetail = () => {
    setSelectedNodeId(null);
  };

  const handleStartQuiz = (nodeId: string) => {
    setSelectedNodeId(null);
    setQuizNodeId(nodeId);
  };

  const handleCloseQuiz = () => {
    setQuizNodeId(null);
  };

  const getNodesByCategory = (category: string) => {
    return knowledgeGraph.nodes.filter(node => node.category === category);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-gray-900">TypeScript 学习</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Basic Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  核心基础
                </h3>
                <div className="space-y-2">
                  {getNodesByCategory('basic').map(node => (
                    <button
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{node.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          L{node.level}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{node.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  进阶核心
                </h3>
                <div className="space-y-2">
                  {getNodesByCategory('advanced').map(node => (
                    <button
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{node.title}</span>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          L{node.level}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{node.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Practical Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  高级与实践
                </h3>
                <div className="space-y-2">
                  {getNodesByCategory('practical').map(node => (
                    <button
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{node.title}</span>
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                          L{node.level}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{node.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">TypeScript 知识图谱</h2>
              <p className="text-gray-600 mt-1">点击节点查看详细内容，开始你的TypeScript学习之旅</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>核心基础</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>进阶核心</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-purple-400 rounded"></div>
                <span>高级与实践</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Graph */}
        <div className="flex-1">
          <KnowledgeGraph 
            data={knowledgeGraph}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
            masteredNodes={new Set()}
          />
        </div>
      </div>

      {/* Modals */}
      <KnowledgeDetail
        nodeId={selectedNodeId}
        onClose={handleCloseDetail}
        onStartQuiz={handleStartQuiz}
      />
      
      <QuizModal
        nodeId={quizNodeId}
        onClose={handleCloseQuiz}
      />
    </div>
  );
}
