'use client';

import { useState } from 'react';

export default function APIAITestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPIAI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('开始API AI测试...');
      
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API响应状态:', response.status);
      
      const data = await response.json();
      console.log('API响应数据:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      setResult(data.content || data.message);
    } catch (err) {
      console.error('API测试失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">API AI 测试</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testAPIAI}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '测试中...' : '测试 API AI'}
        </button>
        
        {error && (
          <div className="alert alert-error">
            <span>错误: {error}</span>
          </div>
        )}
        
        {result && (
          <div className="alert alert-success">
            <span>成功: {result}</span>
          </div>
        )}
      </div>
    </div>
  );
}