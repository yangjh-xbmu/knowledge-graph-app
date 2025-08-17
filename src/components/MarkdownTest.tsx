'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownTest() {
  // 测试不同的Markdown格式
  const testCases = [
    {
      name: '行内代码（单反引号）',
      content: '这是一个 `message` 参数的示例。'
    },
    {
      name: '代码块（三反引号）',
      content: '```\nfunction test() {\n  console.log("hello");\n}\n```'
    },
    {
      name: '混合内容',
      content: '使用 `console.log()` 函数：\n\n```javascript\nconsole.log("Hello World");\n```'
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ReactMarkdown 渲染测试</h1>
      
      {testCases.map((testCase, index) => (
        <div key={index} className="mb-8 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">{testCase.name}</h2>
          
          {/* 原始内容 */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">原始Markdown:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm font-mono">
              {testCase.content}
            </pre>
          </div>
          
          {/* 渲染结果 */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">渲染结果:</h3>
            <div className="border p-3 rounded bg-white">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, ...props }: any) => {
                    // 判断是否为代码块的逻辑：
                    // 1. 有language-xxx的className（指定语言的代码块）
                    // 2. 或者内容包含换行符（没有指定语言的代码块）
                    const hasLanguageClass = className && className.startsWith('language-');
                    const hasNewlines = String(children).includes('\n');
                    const isCodeBlock = hasLanguageClass || hasNewlines;
                    
                    console.log(`测试${index + 1} - 代码渲染:`, { 
                      isCodeBlock,
                      hasLanguageClass,
                      hasNewlines,
                      className, 
                      children: String(children),
                      content: testCase.content
                    });
                    
                    return isCodeBlock ? (
                      <pre className="bg-blue-100 rounded-lg p-3 overflow-x-auto my-2 border-2 border-blue-400">
                        <div className="text-xs text-blue-600 mb-1">[代码块]</div>
                        <code className={`font-mono text-sm ${className || ''}`} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-yellow-100 px-1 py-0.5 rounded text-sm font-mono border border-yellow-300" {...props}>
                        [行内] {children}
                      </code>
                    );
                  },
                  p: ({ children }: any) => (
                    <div className="leading-relaxed">{children}</div>
                  ),
                }}
              >
                {testCase.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
