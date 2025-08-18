'use client';

import { useState } from 'react';

interface ApiTestResult {
  success: boolean;
  message: string;
  data?: {
    prompt: string;
    response: string;
    metadata: {
      config: string;
      responseTime: number;
      timestamp: string;
      apiKeyLength: number;
    };
  };
  error?: string;
  details?: {
    timestamp: string;
    errorName: string;
    stack?: string;
    nodeVersion: string;
    platform: string;
  };
}

export default function DirectApiTestPage() {
  const [prompt, setPrompt] = useState('你好，请简单介绍一下自己。');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('开始直接API测试...');
      
      const response = await fetch('/api/test-direct-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('API响应:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      console.error('直接API测试失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">直接API连接测试</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">测试说明</h2>
        <p className="text-blue-700">
          此测试直接调用Google Gemini API，绕过LangChain库，用于诊断网络连接问题。
          测试将尝试多种网络配置来确定最佳连接方式。
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            测试提示词
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="输入要测试的提示词..."
          />
        </div>

        <button
          onClick={testDirectApi}
          disabled={loading || !prompt.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '测试中...' : '开始直接API测试'}
        </button>
      </div>

      {loading && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
            <span className="text-yellow-800">正在测试多种网络配置...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">测试失败</h3>
          <p className="text-red-700 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {result.success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ 测试成功！</h3>
              <p className="text-green-700 mb-4">{result.message}</p>
              
              {result.data && (
                <>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold mb-2">AI响应:</h4>
                    <p className="text-gray-800 whitespace-pre-wrap">{result.data.response}</p>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                    <h4 className="font-semibold mb-2">测试元数据:</h4>
                    <div className="space-y-1 text-gray-600">
                      <p><strong>成功配置:</strong> {result.data.metadata.config}</p>
                      <p><strong>响应时间:</strong> {result.data.metadata.responseTime}ms</p>
                      <p><strong>API密钥长度:</strong> {result.data.metadata.apiKeyLength}</p>
                      <p><strong>测试时间:</strong> {new Date(result.data.metadata.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ 测试失败</h3>
              <p className="text-red-700 mb-4">{result.message}</p>
              
              {result.details && (
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold mb-2">错误详情:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>错误类型:</strong> {result.details.errorName}</p>
                    <p><strong>Node.js版本:</strong> {result.details.nodeVersion}</p>
                    <p><strong>平台:</strong> {result.details.platform}</p>
                    <p><strong>时间:</strong> {new Date(result.details.timestamp).toLocaleString()}</p>
                    {result.details.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">错误堆栈</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {result.details.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">诊断提示</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>如果测试成功:</strong> 说明网络连接正常，LangChain的问题可能在于库配置或版本兼容性。</p>
          <p><strong>如果测试失败:</strong> 说明存在网络层面的问题，可能是防火墙、代理或DNS配置问题。</p>
          <p><strong>检查终端日志:</strong> 详细的网络诊断信息会输出到终端控制台。</p>
        </div>
      </div>
    </div>
  );
}