'use client';

import React, { useState, useEffect } from 'react';
import { Quiz } from '../types/knowledge';
import { aiService, QuizQuestion } from '../services/aiService';
import { knowledgeGraph } from '../data/knowledgeData';

interface QuizModalProps {
  nodeId: string | null;
  onClose: () => void;
}

// 将AI服务的QuizQuestion转换为Quiz类型
const convertToQuiz = (question: QuizQuestion, nodeId: string): Quiz => {
  return {
    id: question.id,
    nodeId: nodeId,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation
  };
};

// 使用AI服务生成测试题
const generateQuizForNode = async (nodeId: string): Promise<Quiz[]> => {
  try {
    // 从知识数据中找到对应的知识点
    const knowledgeNode = knowledgeGraph.nodes.find((node: any) => node.id === nodeId);
    if (!knowledgeNode) {
      throw new Error(`Knowledge node with id ${nodeId} not found`);
    }

    // 使用AI服务生成测试题
    const quizData = await aiService.generateQuiz(knowledgeNode, 3);
    
    // 转换为Quiz类型
    return quizData.questions.map(question => convertToQuiz(question, nodeId));
  } catch (error) {
    console.error('Error generating quiz:', error);
    
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

export default function QuizModal({ nodeId, onClose }: QuizModalProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (nodeId) {
      setIsLoading(true);
      
      // 使用AI服务生成测试题
      generateQuizForNode(nodeId)
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

    if (selectedAnswer === currentQuiz.correctAnswer) {
      setScore(score + 1);
    }

    if (isLastQuiz) {
      setShowResult(true);
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {showResult ? '测试结果' : `测试题 ${currentQuizIndex + 1}/${quizzes.length}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
                <div className="space-y-4">
                  {quizzes.map((quiz, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === quiz.correctAnswer;
                    return (
                      <div key={quiz.id} className="border rounded-lg p-4">
                        <div className="font-medium mb-2">{quiz.question}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          你的答案: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {quiz.options[userAnswer]}
                          </span>
                          {!isCorrect && (
                            <span className="ml-2">
                              正确答案: <span className="text-green-600">{quiz.options[quiz.correctAnswer]}</span>
                            </span>
                          )}
                        </div>
                        {!isCorrect && (
                          <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                            {quiz.explanation}
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
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {currentQuiz?.question}
                </h3>
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
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
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