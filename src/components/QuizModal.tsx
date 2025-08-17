'use client';

import React, { useState, useEffect } from 'react';
import { Quiz } from '../types/knowledge';

interface QuizModalProps {
  nodeId: string | null;
  onClose: () => void;
}

// 模拟AI生成的测试题数据
const generateQuizForNode = (nodeId: string): Quiz[] => {
  const quizData: Record<string, Quiz[]> = {
    'basic-types': [
      {
        id: 'q1',
        nodeId: 'basic-types',
        question: '以下哪个是TypeScript新增的类型？',
        options: ['string', 'number', 'unknown', 'boolean'],
        correctAnswer: 2,
        explanation: 'unknown是TypeScript新增的类型，它是any的安全版本，使用前必须进行类型检查。'
      },
      {
        id: 'q2',
        nodeId: 'basic-types',
        question: '元组(Tuple)的正确写法是？',
        options: ['[string, number]', 'Array<string, number>', '{string, number}', 'string | number'],
        correctAnswer: 0,
        explanation: '元组使用方括号表示，如[string, number]表示一个已知长度和类型的数组。'
      },
      {
        id: 'q3',
        nodeId: 'basic-types',
        question: '什么时候应该使用any类型？',
        options: ['任何时候都可以使用', '从JavaScript迁移时临时使用', '定义复杂对象时', '性能要求高的场景'],
        correctAnswer: 1,
        explanation: 'any类型会放弃类型检查，应该慎用。主要在从JavaScript迁移到TypeScript时临时使用。'
      }
    ],
    'functions': [
      {
        id: 'q4',
        nodeId: 'functions',
        question: '可选参数的正确语法是？',
        options: ['name: string?', 'name?: string', 'name: ?string', 'optional name: string'],
        correctAnswer: 1,
        explanation: '可选参数使用?:语法，如name?: string表示name参数是可选的。'
      },
      {
        id: 'q5',
        nodeId: 'functions',
        question: '函数重载的作用是什么？',
        options: ['提高性能', '为同一函数提供多个类型定义', '减少代码量', '支持异步操作'],
        correctAnswer: 1,
        explanation: '函数重载允许为同一个函数提供多个函数类型定义，以支持不同的参数组合。'
      }
    ],
    'generics': [
      {
        id: 'q6',
        nodeId: 'generics',
        question: '泛型的核心作用是什么？',
        options: ['提高运行速度', '创建可重用的组件', '减少内存使用', '简化语法'],
        correctAnswer: 1,
        explanation: '泛型的核心作用是创建可重用的组件，使其能够处理多种数据类型而不是单一类型。'
      },
      {
        id: 'q7',
        nodeId: 'generics',
        question: '泛型约束使用哪个关键字？',
        options: ['implements', 'extends', 'constrains', 'limits'],
        correctAnswer: 1,
        explanation: '泛型约束使用extends关键字，如<T extends Lengthwise>限制泛型类型必须包含length属性。'
      }
    ]
  };

  return quizData[nodeId] || [
    {
      id: 'default',
      nodeId,
      question: '这个知识点的核心概念是什么？',
      options: ['选项A', '选项B', '选项C', '选项D'],
      correctAnswer: 0,
      explanation: '这是一个示例题目，实际应用中会根据知识点内容生成相应的测试题。'
    }
  ];
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
      // 模拟AI生成题目的延迟
      setTimeout(() => {
        const generatedQuizzes = generateQuizForNode(nodeId);
        setQuizzes(generatedQuizzes);
        setIsLoading(false);
      }, 1000);
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