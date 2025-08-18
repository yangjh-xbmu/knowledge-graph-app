'use client';

import { useState } from 'react';

interface LangChainTestResult {
  success: boolean;
  result?: string;
  metadata?: {
    topic: string;
    duration: number;
    resultLength: number;
    modelName: string;
    timestamp: string;
  };
  error?: string;
  details?: string;
  errorType?: string;
}

export default function LangChainTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LangChainTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('JavaScript基础');

  const testLangChain = async () => {
    console.log('前端: 开始LangChain测试...');
    console.log('前端: 测试主题:', topic);
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('前端: 发送请求到 /api/test-langchain');
      const response = await fetch('/api/test-langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      console.log('前端: 收到响应，状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('前端: 解析响应数据:', data);
      
      if (data.success) {
        console.log('前端: LangChain测试成功');
        console.log('前端: 结果长度:', data.result?.length || 0);
        console.log('前端: 执行耗时:', data.metadata?.duration || 0, 'ms');
      } else {
        console.error('前端: LangChain测试失败:', data.error);
      }
      
      setResult(data);
    } catch (err) {
      console.error('前端: LangChain测试请求失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
      console.log('前端: LangChain测试完成');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">LangChain 测试</h1>
      
      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">测试主题</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input input-bordered w-full max-w-md"
            placeholder="输入要测试的主题"
          />
        </div>

        <button
          onClick={testLangChain}
          disabled={loading || !topic.trim()}
          className="btn btn-primary"
        >
          {loading ? '测试中...' : '开始 LangChain 测试'}
        </button>

        {loading && (
          <div className="alert alert-info">
            <span>正在执行 LangChain 链式调用...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>错误: {error}</span>
          </div>
        )}

        {result && (
          <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
            <div className="w-full">
              {result.success ? (
                <>
                  <h3 className="font-bold mb-2">LangChain 测试成功!</h3>
                  
                  {result.metadata && (
                    <div className="mb-4 text-sm">
                      <p><strong>主题:</strong> {result.metadata.topic}</p>
                      <p><strong>执行时间:</strong> {result.metadata.duration}ms</p>
                      <p><strong>结果长度:</strong> {result.metadata.resultLength} 字符</p>
                      <p><strong>模型:</strong> {result.metadata.modelName}</p>
                    </div>
                  )}
                  
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">AI 生成结果:</h4>
                    <pre className="whitespace-pre-wrap text-sm">
                      {result.result}
                    </pre>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold mb-2">LangChain 测试失败</h3>
                  <p><strong>错误:</strong> {result.error}</p>
                  {result.details && <p><strong>详情:</strong> {result.details}</p>}
                  {result.errorType && <p><strong>错误类型:</strong> {result.errorType}</p>}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p>此测试使用完整的 LangChain 架构:</p>
        <ul className="list-disc list-inside mt-2">
          <li>ChatGoogleGenerativeAI - Google Gemini 模型</li>
          <li>PromptTemplate - 结构化提示模板</li>
          <li>RunnableSequence - 链式执行序列</li>
          <li>StringOutputParser - 字符串输出解析器</li>
        </ul>
        <p className="mt-2">请查看浏览器控制台和终端日志获取详细信息。</p>
      </div>
    </div>
  );
}