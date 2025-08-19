'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 模拟AI服务 - 专门用于Markdown格式修正
const fixMarkdownFormatWithAI = async (content: string): Promise<string> => {
  // 这里模拟调用AI服务来修正Markdown格式
  console.log('原始内容:', content);
  
  // 简单的格式修正逻辑（后续会替换为真正的AI调用）
  let fixed = content;
  
  // 修正不完整的代码块
  fixed = fixed.replace(/(typescript|javascript|python|java|cpp|c)\n([^`]+)\n/g, '```$1\n$2\n```\n');
  
  // 修正单行代码格式
  fixed = fixed.replace(/^(\w+)\s*\n([^\n]+;?)$/gm, '```$1\n$2\n```');
  
  console.log('修正后内容:', fixed);
  return fixed;
};

const AIMarkdownTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    original: string;
    fixed: string;
    rendered: boolean;
  }>>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);

  // 测试用例 - 各种有问题的Markdown格式
  const testCases = [
    {
      name: '不完整的TypeScript代码块',
      content: 'typescript\nemail?: string;\n'
    },
    {
      name: '不完整的JavaScript代码块',
      content: 'javascript\nconst name = "test";\nconsole.log(name);\n'
    },
    {
      name: '混合格式问题',
      content: '这是一个接口定义：\ntypescript\ninterface User {\n  id: number;\n  name: string;\n}\n\n还有一个函数：\njavascript\nfunction getName() {\n  return "test";\n}'
    },
    {
      name: '单行代码问题',
      content: 'python\nprint("Hello World")\n'
    },
    {
      name: '复杂混合内容',
      content: '以下是用户模型：\ntypescript\ntype User = {\n  id: string;\n  email?: string;\n  profile: {\n    name: string;\n    avatar?: string;\n  };\n};\n\n对应的API调用：\njavascript\nconst user = await fetch("/api/user").then(r => r.json());\n'
    }
  ];

  const runTests = async () => {
    setIsProcessing(true);
    const results = [];
    
    for (const testCase of testCases) {
      try {
        const fixed = await fixMarkdownFormatWithAI(testCase.content);
        results.push({
          name: testCase.name,
          original: testCase.content,
          fixed: fixed,
          rendered: true
        });
      } catch (error) {
        console.error(`测试 "${testCase.name}" 失败:`, error);
        results.push({
          name: testCase.name,
          original: testCase.content,
          fixed: '处理失败',
          rendered: false
        });
      }
    }
    
    setTestResults(results);
    setIsProcessing(false);
  };

  const markdownComponents = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const hasLanguageClass = !!match;
      const content = String(children).replace(/\n$/, '');
      const hasNewlines = content.includes('\n');
      const isMultiLine = content.split('\n').length > 1;
      
      // 增强的代码块检测逻辑
      const hasLanguageIdentifier = /^(typescript|javascript|python|java|cpp|c|html|css|json|xml|yaml|sql)\s*$/i.test(content.trim());
      const startsWithLanguage = /^(typescript|javascript|python|java|cpp|c|html|css|json|xml|yaml|sql)\n/i.test(content);
      const hasCodeCharacters = /[{}();\[\]<>=!&|+\-*/%]/.test(content);
      const hasTypescriptSyntax = /[?:]\s*(string|number|boolean|object|any)\s*[;,}]/.test(content);
      
      console.log('代码块检测:', {
        content: content.substring(0, 50) + '...',
        hasLanguageClass,
        hasNewlines,
        isMultiLine,
        hasLanguageIdentifier,
        startsWithLanguage,
        hasCodeCharacters,
        hasTypescriptSyntax,
        inline
      });
      
      const shouldRenderAsCodeBlock = !inline && (
        hasLanguageClass || 
        hasNewlines || 
        isMultiLine ||
        hasLanguageIdentifier ||
        startsWithLanguage ||
        (hasCodeCharacters && content.length > 10) ||
        hasTypescriptSyntax
      );
      
      if (shouldRenderAsCodeBlock) {
        const language = match ? match[1] : 'text';
        return (
          <SyntaxHighlighter
            style={tomorrow as { [key: string]: React.CSSProperties }}
            language={language}
            PreTag="div"
            className="rounded-md"
            {...props}
          >
            {content}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Markdown格式修正测试</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isProcessing}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isProcessing ? '处理中...' : '运行测试'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-8">
          {testResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{result.name}</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 原始内容 */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-red-600">原始内容</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <pre className="text-sm whitespace-pre-wrap">{result.original}</pre>
                  </div>
                  <div className="mt-2 bg-red-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">原始渲染效果：</h4>
                    <ReactMarkdown components={markdownComponents}>
                      {result.original}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* 修正后内容 */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-green-600">修正后内容</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <pre className="text-sm whitespace-pre-wrap">{result.fixed}</pre>
                  </div>
                  <div className="mt-2 bg-green-50 p-4 rounded border">
                    <h4 className="font-medium mb-2">修正后渲染效果：</h4>
                    <ReactMarkdown components={markdownComponents}>
                      {result.fixed}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {testResults.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          点击&quot;运行测试&quot;开始测试AI Markdown格式修正功能
        </div>
      )}
    </div>
  );
};

export default AIMarkdownTest;
