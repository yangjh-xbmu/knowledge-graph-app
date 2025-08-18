'use client';

import { useState } from 'react';

interface LangChainTestResult {
  success: boolean;
  message: string;
  data?: {
    topic: string;
    response: string;
    metadata: {
      model: string;
      executionTime: number;
      timestamp: string;
      chainSteps: string[];
      apiKeyExists: boolean;
      apiKeyLength: number;
    };
  };
  error?: string;
  details?: {
    timestamp: string;
    stack?: string;
  };
}

export default function LangChainLocalTestPage() {
  const [topic, setTopic] = useState('编程');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LangChainTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testLangChain = async () => {
    console.log('=== 开始LangChain本地测试 ===');
    console.log('测试主题:', topic);
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('发送API请求到 /api/test-langchain-local');
      
      const response = await fetch('/api/test-langchain-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      console.log('API响应状态:', response.status);
      console.log('API响应状态文本:', response.statusText);

      const data: LangChainTestResult = await response.json();
      console.log('API响应数据:', data);

      setResult(data);

      if (data.success) {
        console.log('✅ LangChain本地测试成功!');
        console.log('AI响应:', data.data?.response);
        console.log('执行时间:', data.data?.metadata.executionTime, 'ms');
        console.log('链步骤:', data.data?.metadata.chainSteps);
      } else {
        console.log('❌ LangChain本地测试失败:', data.message);
        setError(data.error || '未知错误');
      }
    } catch (err) {
      console.error('❌ API调用失败:', err);
      const errorMessage = err instanceof Error ? err.message : '网络请求失败';
      setError(errorMessage);
      setResult({
        success: false,
        message: 'API调用失败',
        error: errorMessage
      });
    } finally {
      setLoading(false);
      console.log('=== LangChain本地测试结束 ===\n');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            LangChain 本地测试
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              这个测试使用模拟的LangChain组件，不依赖外部网络连接。
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  测试主题:
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入测试主题，如：编程、数学、物理、化学"
                />
              </div>
              
              <button
                onClick={testLangChain}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? '测试中...' : '开始LangChain测试'}
              </button>
            </div>
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-blue-700">正在执行LangChain链式调用...</span>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-medium mb-2">测试失败</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 测试结果 */}
          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-medium mb-2 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ 测试成功' : '❌ 测试失败'}
                </h3>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
              </div>

              {result.success && result.data && (
                <div className="space-y-4">
                  {/* AI响应 */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-blue-800 font-medium mb-2">AI 响应:</h4>
                    <p className="text-blue-700 whitespace-pre-wrap">
                      {result.data.response}
                    </p>
                  </div>

                  {/* 元数据 */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="text-gray-800 font-medium mb-3">执行信息:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">测试主题:</span>
                        <span className="ml-2 text-gray-800">{result.data.topic}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">模型:</span>
                        <span className="ml-2 text-gray-800">{result.data.metadata.model}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">执行时间:</span>
                        <span className="ml-2 text-gray-800">{result.data.metadata.executionTime}ms</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">API密钥状态:</span>
                        <span className="ml-2 text-gray-800">
                          {result.data.metadata.apiKeyExists ? '✅ 存在' : '❌ 不存在'}
                          {result.data.metadata.apiKeyExists && ` (长度: ${result.data.metadata.apiKeyLength})`}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">链步骤:</span>
                        <span className="ml-2 text-gray-800">
                          {result.data.metadata.chainSteps.join(' → ')}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">时间戳:</span>
                        <span className="ml-2 text-gray-800">
                          {new Date(result.data.metadata.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-yellow-800 font-medium mb-2">💡 使用说明:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• 这是一个本地模拟的LangChain测试，不需要网络连接</li>
              <li>• 支持的测试主题：编程、数学、物理、化学（会有不同的响应）</li>
              <li>• 模拟了完整的LangChain链式调用流程：PromptTemplate → MockLLM</li>
              <li>• 查看浏览器控制台可以看到详细的执行日志</li>
              <li>• 查看终端日志可以看到服务端的详细执行过程</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}