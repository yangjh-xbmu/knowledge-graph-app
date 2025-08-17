import React, { useState, useEffect } from 'react';
import { knowledgeGraph } from '../data/knowledgeData';
import { Quiz } from '../types/knowledge';

interface QuizModalProps {
  nodeId: string | null;
  onClose: () => void;
}

// 模拟测验数据 - 在实际项目中这些应该来自数据库或API
const generateQuizForNode = (nodeId: string): Quiz[] => {
  const node = knowledgeGraph.nodes.find(n => n.id === nodeId);
  if (!node) return [];

  // 这里是一些示例测验，实际项目中应该有完整的测验数据
  const sampleQuizzes: { [key: string]: Quiz[] } = {
    'basic-types': [
      {
        id: 'q1',
        nodeId: 'basic-types',
        question: '以下哪个是 TypeScript 新增的类型？',
        options: ['string', 'number', 'unknown', 'boolean'],
        correctAnswer: 2,
        explanation: 'unknown 是 TypeScript 新增的类型，它是 any 的安全版本。'
      },
      {
        id: 'q2',
        nodeId: 'basic-types',
        question: '元组类型的正确写法是？',
        options: ['[string, number]', 'Array<string, number>', 'string | number', 'string & number'],
        correctAnswer: 0,
        explanation: '元组使用方括号语法 [string, number] 来定义固定长度和类型的数组。'
      }
    ],
    'functions': [
      {
        id: 'q3',
        nodeId: 'functions',
        question: '可选参数的正确语法是？',
        options: ['name: string?', 'name?: string', 'name: ?string', 'optional name: string'],
        correctAnswer: 1,
        explanation: '可选参数使用 ? 符号，写法是 name?: string。'
      }
    ]
  };

  return sampleQuizzes[nodeId] || [
    {
      id: 'default',
      nodeId,
      question: `关于 "${node.title}" 的理解，你认为最重要的是什么？`,
      options: [
        '理解基本概念',
        '掌握实际应用',
        '了解最佳实践',
        '熟悉相关工具'
      ],
      correctAnswer: 0,
      explanation: '理解基本概念是学习任何技术的基础。'
    }
  ];
};

const QuizModal: React.FC<QuizModalProps> = ({ nodeId, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    if (nodeId) {
      const nodeQuizzes = generateQuizForNode(nodeId);
      setQuizzes(nodeQuizzes);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setAnswers([]);
    }
  }, [nodeId]);

  if (!nodeId || quizzes.length === 0) return null;

  const currentQuiz = quizzes[currentQuestionIndex];
  const node = knowledgeGraph.nodes.find(n => n.id === nodeId);

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

    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
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
    if (percentage >= 80) return '优秀！你已经很好地掌握了这个知识点。';
    if (percentage >= 60) return '不错！建议再复习一下相关内容。';
    return '需要加强！建议重新学习这个知识点。';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {node?.title} - 测验
            </h2>
            {!showResult && (
              <p className="text-gray-600 text-sm mt-1">
                问题 {currentQuestionIndex + 1} / {quizzes.length}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showResult ? (
            <div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quizzes.length) * 100}%` }}
                ></div>
              </div>

              {/* Question */}
              <h3 className="text-lg font-semibold mb-4">{currentQuiz.question}</h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedAnswer !== null
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentQuestionIndex < quizzes.length - 1 ? '下一题' : '完成测验'}
                </button>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="text-center">
              <div className="mb-6">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
                  {score} / {quizzes.length}
                </div>
                <div className={`text-lg mb-4 ${getScoreColor()}`}>
                  {Math.round((score / quizzes.length) * 100)}%
                </div>
                <p className="text-gray-600">{getScoreMessage()}</p>
              </div>

              {/* Answer Review */}
              <div className="text-left mb-6">
                <h4 className="font-semibold mb-3">答案解析：</h4>
                <div className="space-y-4">
                  {quizzes.map((quiz, index) => (
                    <div key={quiz.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          answers[index] === quiz.correctAnswer
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {answers[index] === quiz.correctAnswer ? '✓' : '✗'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium mb-1">{quiz.question}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            正确答案: {String.fromCharCode(65 + quiz.correctAnswer)}. {quiz.options[quiz.correctAnswer]}
                          </p>
                          <p className="text-sm text-gray-500">{quiz.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  重新测验
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  完成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;