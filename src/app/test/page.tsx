import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const sampleMarkdownContent = `
# Markdown 渲染测试

这是一个测试页面，用于验证 Markdown 渲染功能。

## 代码高亮测试

### TypeScript 代码
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email?: string;
}

const user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};
\`\`\`

### JavaScript 代码
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

## 列表测试

- 项目 1
- 项目 2
- 项目 3

## 强调文本

这是 **粗体文本** 和 *斜体文本*。
`;

export default function TestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Markdown 测试页面</h1>
      <div className="prose max-w-none">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {sampleMarkdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
