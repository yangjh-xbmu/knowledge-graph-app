import { QuizMarkdownRenderer } from '../../components/QuizMarkdownRenderer';

const sampleQuizContent = `
# TypeScript 基础测试

## 问题 1
以下哪个是 TypeScript 新增的类型？

**选项：**
- A. string
- B. number  
- C. unknown
- D. boolean

**答案：** C. unknown

**解释：** unknown 是 TypeScript 新增的类型，它是 any 的安全版本。

## 问题 2
元组类型的正确写法是？

**选项：**
- A. [string, number]
- B. Array<string, number>
- C. string | number
- D. string & number

**答案：** A. [string, number]

**解释：** 元组使用方括号语法 [string, number] 来定义固定长度和类型的数组。
`;

export default function QuizTestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">测验渲染测试</h1>
      <QuizMarkdownRenderer content={sampleQuizContent} />
    </div>
  );
}