import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface QuizMarkdownRendererProps {
  content: string;
  className?: string;
}

export const QuizMarkdownRenderer: React.FC<QuizMarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`quiz-markdown ${className}`}>
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
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-6 mb-4 text-blue-600">
              {children}
            </h2>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-800">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-2 ml-4">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>{children}</span>
            </li>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Add default export to match project convention
export default QuizMarkdownRenderer;