'use client';

import { useState } from 'react';

interface MetadataType {
  model?: {
    name?: string;
    provider?: string;
    needsProxy?: boolean;
  };
  responseTime?: number;
  timestamp?: string;
}

export default function AITestNewPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel] = useState<'kimi'>('kimi');
  const [question, setQuestion] = useState('1+1等于多少？');
  const [metadata, setMetadata] = useState<MetadataType | null>(null);

  const testAI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setMetadata(null);

    try {
      console.log('开始AI测试...');
      console.log('选择的模型:', selectedModel);
      console.log('测试问题:', question);
      
      const response = await fetch('/api/test-ai-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question
        }),
      });
      
      console.log('API响应状态:', response.status);
      
      const data = await response.json();
      console.log('API响应数据:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      setResult(data.content || data.message);
      setMetadata(data.metadata);
    } catch (err) {
      console.error('AI测试失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">新版AI内容测试</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">功能说明</h2>
        <p className="text-blue-700 mb-2">
          此页面使用Kimi AI模型进行测试：
        </p>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li><strong>Kimi (kimi-k2-0711-preview)</strong> - 月之暗面提供，无需代理直接访问</li>
        </ul>
      </div>

      <div className="space-y-6">
        {/* 当前使用的模型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            当前AI模型
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <span className="text-sm font-medium text-gray-800">
              <strong>Kimi (kimi-k2-0711-preview)</strong> - 月之暗面AI模型
            </span>
          </div>
        </div>

        {/* 问题输入 */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            测试问题
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="输入要测试的问题..."
          />
        </div>

        {/* 测试按钮 */}
        <button 
          onClick={testAI}
          disabled={loading || !question.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '测试中...' : '测试 Kimi AI'}
        </button>

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">错误</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 成功结果显示 */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">AI响应</h3>
            <div className="text-green-700 whitespace-pre-wrap">{result}</div>
            
            {/* 元数据显示 */}
            {metadata && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2">响应信息</h4>
                <div className="text-sm text-green-600 space-y-1">
                  <p><strong>模型:</strong> {metadata.model?.name} ({metadata.model?.provider})</p>
                  <p><strong>响应时间:</strong> {metadata.responseTime}ms</p>
                  <p><strong>需要代理:</strong> {metadata.model?.needsProxy ? '是' : '否'}</p>
                  <p><strong>时间戳:</strong> {metadata.timestamp ? new Date(metadata.timestamp).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}