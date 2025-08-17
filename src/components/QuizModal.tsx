'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Quiz } from '../types/knowledge';
import { aiService, QuizQuestion } from '../services/aiService';
import { knowledgeGraph } from '../data/knowledgeData';
import { masteryService } from '../services/masteryService';

interface QuizModalProps {
  nodeId: string | null;
  onClose: () => void;
}

// 将AI服务的QuizQuestion转换为Quiz类型
const convertToQuiz = (question: QuizQuestion, nodeId: string): Quiz => {
  return {
    id: question.id,
    nodeId,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation
  };
};

// 智能分析知识点内容结构，动态计算题目数量
const calculateQuestionCount = (knowledgeNode: any): number => {
  const content = knowledgeNode.content || '';
  const examples = knowledgeNode.examples || [];
  
  // 分析内容结构的复杂度指标
  const structuralComplexity = analyzeContentStructure(content);
  
  // 基础题目数量：根据结构复杂度
  let baseCount = Math.max(3, Math.min(10, structuralComplexity.conceptCount));
  
  // 根据内容深度调整
  const depthMultiplier = 1 + (structuralComplexity.depth - 1) * 0.2;
  
  // 根据示例数量调整（每个示例增加0.5题）
  const exampleBonus = Math.min(3, examples.length * 0.5);
  
  // 最终计算
  const finalCount = Math.round(baseCount * depthMultiplier + exampleBonus);
  return Math.max(3, Math.min(12, finalCount)); // 限制在3-12题之间
};

// 分析内容结构复杂度
const analyzeContentStructure = (content: string) => {
  // 统计标题层级（## ### ####等）
  const headingMatches = content.match(/^#{2,6}\s+/gm) || [];
  const headingCount = headingMatches.length;
  
  // 统计列表项（- * +开头的行）
  const listMatches = content.match(/^\s*[-*+]\s+/gm) || [];
  const listItemCount = listMatches.length;
  
  // 统计代码块
  const codeBlockMatches = content.match(/```[\s\S]*?```/g) || [];
  const codeBlockCount = codeBlockMatches.length;
  
  // 统计行内代码
  const inlineCodeMatches = content.match(/`[^`]+`/g) || [];
  const inlineCodeCount = inlineCodeMatches.length;
  
  // 计算概念密度（基于关键词和结构）
  const conceptCount = Math.max(
    headingCount, // 每个标题代表一个概念
    Math.ceil(listItemCount / 3), // 每3个列表项约等于一个概念
    Math.ceil((codeBlockCount + inlineCodeCount) / 2) // 代码示例也代表概念
  );
  
  // 计算内容深度（基于标题层级）
  const maxHeadingLevel = headingMatches.reduce((max, heading) => {
    const level = (heading.match(/#/g) || []).length;
    return Math.max(max, level - 1); // -1因为我们从##开始计算
  }, 1);
  
  return {
    conceptCount: Math.max(3, conceptCount), // 至少3个概念
    depth: Math.max(1, maxHeadingLevel),
    hasCode: codeBlockCount > 0 || inlineCodeCount > 0,
    structuralRichness: headingCount + listItemCount + codeBlockCount
  };
};

// 使用AI服务生成测试题
const generateQuizForNode = async (nodeId: string, onAiResponse?: (response: any) => void): Promise<Quiz[]> => {
  try {
    // 从知识数据中找到对应的知识点
    const knowledgeNode = knowledgeGraph.nodes.find((node: any) => node.id === nodeId);
    if (!knowledgeNode) {
      throw new Error(`Knowledge node with id ${nodeId} not found`);
    }

    // 根据知识点内容动态计算题目数量
    const questionCount = calculateQuestionCount(knowledgeNode);
    
    // 使用AI服务生成测试题
    const quizData = await aiService.generateQuiz(knowledgeNode, questionCount);
    
    // 保存AI响应数据用于调试
    if (onAiResponse) {
      onAiResponse({
        nodeId,
        knowledgeNode,
        questionCount,
        aiResponse: quizData,
        timestamp: new Date().toISOString()
      });
    }
    
    // 转换为Quiz类型
    return quizData.questions.map(question => convertToQuiz(question, nodeId));
  } catch (error) {
    console.error('Error generating quiz:', error);
    
    // 从知识数据中找到对应的知识点（用于调试信息）
    const knowledgeNode = knowledgeGraph.nodes.find((node: any) => node.id === nodeId);
    
    // 保存错误信息用于调试
    if (onAiResponse) {
      onAiResponse({
        nodeId,
        knowledgeNode,
        questionCount: 2,
        aiResponse: null,
        error: error instanceof Error ? error.message : String(error),
        fallbackUsed: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // 返回备用测试题
    return [
      {
        id: 'fallback-1',
        nodeId,
        question: '这个知识点的核心概念是什么？',
        options: ['基础概念', '高级特性', '实用技巧', '最佳实践'],
        correctAnswer: 0,
        explanation: '这是一个备用题目，当AI服务不可用时显示。请检查网络连接和API配置。'
      },
      {
        id: 'fallback-2',
        nodeId,
        question: '学习这个知识点的最佳方式是什么？',
        options: ['理论学习', '实践练习', '阅读文档', '以上都是'],
        correctAnswer: 3,
        explanation: '学习编程知识点需要理论与实践相结合，多方面学习效果最佳。'
      }
    ];
  }
};

// 可复用的ReactMarkdown组件配置
const markdownComponents = {
  code: ({ className, children, ...props }: any) => {
    const hasLanguageClass = className && className.startsWith('language-');
    const hasNewlines = String(children).includes('\n');
    const isCodeBlock = hasLanguageClass || hasNewlines;
    
    return isCodeBlock ? (
      <pre className="bg-gray-100 rounded-lg p-3 overflow-x-auto my-2 border">
        <code className={`font-mono text-sm ${className || ''}`} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }
};

export default function QuizModal({ nodeId, onClose }: QuizModalProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    if (nodeId) {
      // 重置所有状态
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setAnswers([]);
      setIsLoading(true);
      
      // 使用AI服务生成测试题
      generateQuizForNode(nodeId, (response) => {
        setAiResponse(response);
      })
        .then(generatedQuizzes => {
          setQuizzes(generatedQuizzes);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to generate quiz:', error);
          setIsLoading(false);
          // 设置空数组，让用户知道生成失败
          setQuizzes([]);
        });
    }
  }, [nodeId]);

  if (!nodeId) return null;

  const currentQuiz = quizzes[currentQuizIndex];
  const isLastQuiz = currentQuizIndex === quizzes.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    let finalScore = score;
    if (selectedAnswer === currentQuiz.correctAnswer) {
      finalScore = score + 1;
      setScore(finalScore);
    }

    if (isLastQuiz) {
      setShowResult(true);
      
      // 计算最终分数百分比
      const scorePercentage = (finalScore / quizzes.length) * 100;
      
      // 如果分数达到80%或以上，标记为已掌握
      if (scorePercentage >= 80 && nodeId) {
        masteryService.markAsMastered(nodeId, scorePercentage);
      }
    } else {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setIsLoading(true);
    
    // 重新生成测试题
    if (nodeId) {
      generateQuizForNode(nodeId)
        .then(generatedQuizzes => {
          setQuizzes(generatedQuizzes);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to regenerate quiz:', error);
          setIsLoading(false);
          setQuizzes([]);
        });
    }
  };

  const getScoreColor = () => {
    const percentage = (score / quizzes.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = (score / quizzes.length) * 100;
    if (percentage >= 80) return '优秀！你已经很好地掌握了这个知识点！';
    if (percentage >= 60) return '不错！建议再复习一下相关内容。';
    return '需要加强学习，建议重新阅读知识点内容。';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {showResult ? '测试结果' : `测试题 ${currentQuizIndex + 1}/${quizzes.length}`}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="px-4 py-2 text-sm font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-md transition-colors"
              title="显示/隐藏AI调试信息"
            >
              🔧 {showDebugInfo ? '隐藏调试' : '显示调试'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Debug Info */}
          {showDebugInfo && aiResponse && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">AI调试信息</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">节点ID:</span>
                  <span className="ml-2 text-gray-600">{aiResponse.nodeId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">生成时间:</span>
                  <span className="ml-2 text-gray-600">{new Date(aiResponse.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">题目数量:</span>
                  <span className="ml-2 text-gray-600">{aiResponse.questionCount}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">知识点内容:</span>
                  <div className="mt-1 p-2 bg-white rounded border text-xs max-h-32 overflow-y-auto">
                    {JSON.stringify(aiResponse.knowledgeNode, null, 2)}
                  </div>
                </div>
                {aiResponse.error && (
                  <div>
                    <span className="font-medium text-red-700">错误信息:</span>
                    <div className="mt-1 p-2 bg-red-50 rounded border border-red-200 text-xs">
                      {aiResponse.error}
                    </div>
                  </div>
                )}
                {aiResponse.fallbackUsed && (
                  <div>
                    <span className="font-medium text-yellow-700">状态:</span>
                    <span className="ml-2 text-yellow-600">使用备用题目</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">AI原始响应:</span>
                  <div className="mt-1 p-2 bg-white rounded border text-xs max-h-40 overflow-y-auto">
                    {aiResponse.aiResponse ? (
                      <pre>{JSON.stringify(aiResponse.aiResponse, null, 2)}</pre>
                    ) : (
                      <span className="text-gray-500 italic">无AI响应数据（使用备用题目）</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">AI正在生成测试题...</span>
            </div>
          ) : showResult ? (
            /* Results */
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
                {score}/{quizzes.length}
              </div>
              <div className="text-xl mb-4 text-gray-700">
                正确率: {Math.round((score / quizzes.length) * 100)}%
              </div>
              <div className="text-lg mb-8 text-gray-600">
                {getScoreMessage()}
              </div>
              
              {/* Answer Review */}
              <div className="text-left mb-8">
                <h3 className="text-lg font-semibold mb-4">答题回顾</h3>
                <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                  {quizzes.map((quiz, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === quiz.correctAnswer;
                    return (
                      <div key={quiz.id} className="border rounded-lg p-4">
                        <div className="font-medium mb-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {quiz.question}
                          </ReactMarkdown>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          你的答案: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {quiz.options[userAnswer]}
                            </ReactMarkdown>
                          </span>
                          {!isCorrect && (
                            <span className="ml-2">
                              正确答案: <span className="text-green-600">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                  {quiz.options[quiz.correctAnswer]}
                                </ReactMarkdown>
                              </span>
                            </span>
                          )}
                        </div>
                        {!isCorrect && (
                          <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {quiz.explanation}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重新测试
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  完成
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Question */
            <div>
              <div className="mb-6">
                <div className="text-xl font-semibold mb-4 text-gray-900">

                  <ReactMarkdown 
                     remarkPlugins={[remarkGfm]}
                     components={markdownComponents}
                   >
                    {currentQuiz?.question || ''}
                  </ReactMarkdown>
                </div>
                <div className="space-y-3">
                  {currentQuiz?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>

                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {option}
                        </ReactMarkdown>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  进度: {currentQuizIndex + 1} / {quizzes.length}
                </div>
                <button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedAnswer === null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLastQuiz ? '完成测试' : '下一题'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
