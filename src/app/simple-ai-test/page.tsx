'use client';

import React, { useState } from 'react';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export default function SimpleAITestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testSimpleAI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('开始简单AI测试...');
      console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? '已设置' : '未设置');
      console.log('API Key长度:', process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.length);
      
      if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
        throw new Error('API密钥未设置');
      }
      
      console.log('创建模型...');
      const model = new ChatGoogleGenerativeAI({
        model: 'gemini-1.5-flash', // 使用更稳定的模型
        temperature: 0.7,
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      });
      
      console.log('模型已创建，开始调用...');
      
      const response = await model.invoke('请回答：1+1等于多少？');
      console.log('AI响应:', response);
      console.log('响应内容:', response.content);
      
      setResult(response.content as string);
    } catch (err: unknown) {
      console.error('简单测试失败:', err);
      
      const error = err as any;
      console.error('错误详情:', {
        message: error?.message || '未知错误',
        stack: error?.stack,
        name: error?.name,
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response
      });
      
      let errorMessage = '未知错误';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        errorMessage = `HTTP ${error.status}: ${error.statusText || '请求失败'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">简单AI测试页面</h1>
      
      <button
        onClick={testSimpleAI}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? '测试中...' : '测试简单AI调用'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">错误:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">AI响应:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}