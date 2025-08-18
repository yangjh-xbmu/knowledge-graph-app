'use client';

import React, { useState } from 'react';
import { AIQuizService, AIQuizData } from '../../services/aiQuizService';

export default function AITestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIQuizData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testAIGeneration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('开始测试AI生成...');
      console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? '已设置' : '未设置');
      
      const aiQuizService = new AIQuizService();
      const testKnowledge = {
        title: 'JavaScript变量',
        description: 'JavaScript中的变量声明和使用',
        content: 'JavaScript中可以使用var、let、const来声明变量。var有函数作用域，let和const有块作用域。const声明的变量不能重新赋值。'
      };
      
      console.log('测试知识点:', testKnowledge);
      
      const quizData = await aiQuizService.generateQuiz(testKnowledge);
      console.log('AI生成结果:', quizData);
      
      setResult(quizData);
    } catch (err) {
      console.error('测试失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI生成测试页面</h1>
      
      <button
        onClick={testAIGeneration}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? '生成中...' : '测试AI生成'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">错误:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">生成成功:</h3>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}