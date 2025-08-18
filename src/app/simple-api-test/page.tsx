'use client';

import { useState } from 'react';

interface APITestResult {
  success: boolean;
  message?: string;
  timestamp?: string;
  apiKeyExists?: boolean;
  apiKeyLength?: number;
  error?: string;
  details?: string;
}

export default function SimpleAPITest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<APITestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testSimpleAPI = async () => {
    console.log('前端: 开始测试简单API...');
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('前端: 发送请求到 /api/test-simple');
      const response = await fetch('/api/test-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('前端: 收到响应，状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('前端: 解析响应数据:', data);
      setResult(data);
    } catch (err) {
      console.error('前端: API测试失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
      console.log('前端: 测试完成');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">简单API测试</h1>
      
      <div className="space-y-4">
        <button
          onClick={testSimpleAPI}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '测试中...' : '测试简单API'}
        </button>

        {loading && (
          <div className="alert alert-info">
            <span>正在测试API...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>错误: {error}</span>
          </div>
        )}

        {result && (
          <div className="alert alert-success">
            <div>
              <h3 className="font-bold">测试结果:</h3>
              <pre className="mt-2 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p>请打开浏览器开发者工具的控制台查看详细日志输出。</p>
        <p>同时检查终端中的服务端日志。</p>
      </div>
    </div>
  );
}