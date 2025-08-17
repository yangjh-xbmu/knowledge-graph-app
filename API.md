# API 文档 - TypeScript 知识图谱学习应用

本文档详细描述了项目中的所有接口、数据结构和服务方法。

## 📋 目录

- [数据类型定义](#数据类型定义)
- [AI 服务 API](#ai-服务-api)
- [学习进度服务 API](#学习进度服务-api)
- [组件接口](#组件接口)
- [错误处理](#错误处理)
- [使用示例](#使用示例)

## 🏗️ 数据类型定义

### KnowledgeNode

```typescript
interface KnowledgeNode {
  id: string;                    // 唯一标识符
  title: string;                 // 知识点标题
  description: string;           // 简短描述
  category: 'basic' | 'advanced' | 'practical'; // 分类
  level: number;                 // 难度等级 (1-7)
  prerequisites: string[];       // 前置知识点ID数组
  content: string;               // 详细内容 (Markdown格式)
  examples: string[];            // 代码示例数组
  position: { x: number; y: number }; // 在图谱中的位置
}
```

### KnowledgeEdge

```typescript
interface KnowledgeEdge {
  id: string;                    // 唯一标识符
  source: string;                // 源节点ID
  target: string;                // 目标节点ID
  type: 'prerequisite' | 'related' | 'extends'; // 关系类型
  sourceHandle?: string;         // 源连接点ID
  targetHandle?: string;         // 目标连接点ID
}
```

### KnowledgeGraph

```typescript
interface KnowledgeGraph {
  nodes: KnowledgeNode[];        // 知识点节点数组
  edges: KnowledgeEdge[];        // 关系边数组
}
```

### Quiz 相关类型

```typescript
interface QuizQuestion {
  id: string;                    // 题目唯一标识
  question: string;              // 题目内容
  options: string[];             // 选项数组
  correctAnswer: number;         // 正确答案索引
  explanation: string;           // 答案解释
}

interface QuizData {
  questions: QuizQuestion[];     // 题目数组
  totalQuestions: number;        // 题目总数
}

interface Quiz {
  id: string;                    // 测试唯一标识
  nodeId: string;                // 关联的知识点ID
  questions: QuizQuestion[];     // 题目数组
  createdAt: Date;               // 创建时间
}
```

### MasteryState

```typescript
interface MasteryState {
  nodeId: string;                // 知识点ID
  isMastered: boolean;           // 是否已掌握
  masteredAt: Date;              // 掌握时间
  quizScore?: number;            // 测试分数 (0-100)
  quizAttempts?: number;         // 测试尝试次数
}
```

## 🤖 AI 服务 API

### AIService 类

#### 构造函数

```typescript
constructor()
```

- **描述**：初始化 AI 服务，检查 API Key 配置
- **抛出异常**：当 API Key 未配置时抛出错误

#### generateQuiz

```typescript
async generateQuiz(
  knowledge: KnowledgeNode, 
  questionCount: number = 3
): Promise<QuizData>
```

- **描述**：基于知识点生成测试题目
- **参数**：
  - `knowledge`: 知识点对象
  - `questionCount`: 题目数量，默认3题
- **返回值**：Promise<QuizData> - 生成的测试数据
- **异常处理**：API 调用失败时返回备用题目

#### 私有方法

##### initializeModel

```typescript
private initializeModel(): void
```

- **描述**：初始化 Google Gemini 模型
- **配置**：使用 gemini-1.5-flash 模型

##### createQuizPrompt

```typescript
private createQuizPrompt(
  knowledge: KnowledgeNode, 
  questionCount: number
): string
```

- **描述**：创建 AI 提示词
- **返回值**：格式化的提示词字符串

##### parseQuizResponse

```typescript
private parseQuizResponse(response: string): QuizData
```

- **描述**：解析 AI 响应为标准格式
- **异常处理**：JSON 解析失败时抛出错误

##### getFallbackQuiz

```typescript
private getFallbackQuiz(knowledge: KnowledgeNode): QuizData
```

- **描述**：提供备用测试题目
- **用途**：当 AI 服务不可用时使用

### 使用示例

```typescript
// 初始化服务
const aiService = new AIService();

// 生成测试题目
try {
  const quiz = await aiService.generateQuiz(knowledgeNode, 5);
  console.log('生成的题目:', quiz.questions);
} catch (error) {
  console.error('生成失败:', error.message);
}
```

## 💾 学习进度服务 API

### MasteryService 类

#### getMasteryState

```typescript
getMasteryState(nodeId: string): MasteryState | null
```

- **描述**：获取指定知识点的掌握状态
- **参数**：`nodeId` - 知识点ID
- **返回值**：掌握状态对象或null

#### setMasteryState

```typescript
setMasteryState(nodeId: string, isMastered: boolean, score?: number): void
```

- **描述**：设置知识点掌握状态
- **参数**：
  - `nodeId`: 知识点ID
  - `isMastered`: 是否已掌握
  - `score`: 可选的测试分数

#### getAllMasteryStates

```typescript
getAllMasteryStates(): MasteryState[]
```

- **描述**：获取所有掌握状态
- **返回值**：掌握状态数组

#### clearMasteryState

```typescript
clearMasteryState(nodeId: string): void
```

- **描述**：清除指定知识点的掌握状态
- **参数**：`nodeId` - 知识点ID

#### clearAllMasteryStates

```typescript
clearAllMasteryStates(): void
```

- **描述**：清除所有掌握状态

#### isMastered

```typescript
isMastered(nodeId: string): boolean
```

- **描述**：检查知识点是否已掌握
- **参数**：`nodeId` - 知识点ID
- **返回值**：布尔值

#### getMasteryProgress

```typescript
getMasteryProgress(): { mastered: number; total: number; percentage: number }
```

- **描述**：获取整体学习进度
- **返回值**：包含已掌握数量、总数量和百分比的对象

### 使用示例

```typescript
// 初始化服务
const masteryService = new MasteryService();

// 设置掌握状态
masteryService.setMasteryState('typescript-basics', true, 85);

// 检查掌握状态
const isMastered = masteryService.isMastered('typescript-basics');

// 获取学习进度
const progress = masteryService.getMasteryProgress();
console.log(`学习进度: ${progress.percentage}%`);
```

## 🧩 组件接口

### KnowledgeGraph 组件

```typescript
interface KnowledgeGraphProps {
  onNodeClick: (node: KnowledgeNode) => void; // 节点点击回调
}
```

### KnowledgeDetail 组件

```typescript
interface KnowledgeDetailProps {
  knowledge: KnowledgeNode | null;           // 当前选中的知识点
  onStartQuiz: (knowledge: KnowledgeNode) => void; // 开始测试回调
}
```

### QuizModal 组件

```typescript
interface QuizModalProps {
  isOpen: boolean;                           // 是否显示弹窗
  onClose: () => void;                       // 关闭弹窗回调
  knowledge: KnowledgeNode | null;           // 测试的知识点
  onQuizComplete: (score: number, total: number) => void; // 测试完成回调
}
```

### KnowledgeNode 组件 (React Flow)

```typescript
interface KnowledgeNodeProps extends NodeProps {
  data: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: number;
  };
}
```

## ❌ 错误处理

### 错误类型

#### AIServiceError

```typescript
class AIServiceError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AIServiceError';
  }
}
```

#### MasteryServiceError

```typescript
class MasteryServiceError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MasteryServiceError';
  }
}
```

### 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| `API_KEY_MISSING` | Google API Key 未配置 | 设置环境变量 |
| `API_CALL_FAILED` | AI API 调用失败 | 检查网络连接和 API Key |
| `PARSE_ERROR` | 响应解析失败 | 使用备用题目 |
| `STORAGE_ERROR` | 本地存储操作失败 | 检查浏览器存储权限 |
| `INVALID_NODE_ID` | 无效的知识点ID | 检查节点ID是否存在 |

### 错误处理示例

```typescript
try {
  const quiz = await aiService.generateQuiz(knowledge);
  // 处理成功结果
} catch (error) {
  if (error instanceof AIServiceError) {
    // 处理 AI 服务错误
    console.error('AI 服务错误:', error.message);
    // 使用备用方案
  } else {
    // 处理其他错误
    console.error('未知错误:', error);
  }
}
```

## 📝 使用示例

### 完整的学习流程

```typescript
import { AIService } from './services/aiService';
import { MasteryService } from './services/masteryService';
import { knowledgeGraph } from './data/knowledgeData';

// 初始化服务
const aiService = new AIService();
const masteryService = new MasteryService();

// 1. 获取知识点
const knowledge = knowledgeGraph.nodes.find(node => node.id === 'typescript-basics');

// 2. 检查掌握状态
const isMastered = masteryService.isMastered(knowledge.id);
console.log('是否已掌握:', isMastered);

// 3. 生成测试题目
if (!isMastered) {
  try {
    const quiz = await aiService.generateQuiz(knowledge, 5);
    
    // 4. 模拟答题过程
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      // 这里应该是用户交互逻辑
      const userAnswer = 0; // 假设用户选择第一个选项
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    // 5. 计算分数并更新掌握状态
    const score = (correctAnswers / quiz.totalQuestions) * 100;
    const passed = score >= 70; // 70分及格
    
    masteryService.setMasteryState(knowledge.id, passed, score);
    
    console.log(`测试完成! 分数: ${score}%, ${passed ? '已掌握' : '需要继续学习'}`);
    
  } catch (error) {
    console.error('测试生成失败:', error.message);
  }
}

// 6. 查看整体进度
const progress = masteryService.getMasteryProgress();
console.log(`总体学习进度: ${progress.mastered}/${progress.total} (${progress.percentage}%)`);
```

### React 组件集成示例

```typescript
import React, { useState, useCallback } from 'react';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { KnowledgeDetail } from './components/KnowledgeDetail';
import { QuizModal } from './components/QuizModal';
import type { KnowledgeNode } from './types/knowledge';

function App() {
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeNode | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizKnowledge, setQuizKnowledge] = useState<KnowledgeNode | null>(null);

  // 处理节点点击
  const handleNodeClick = useCallback((knowledge: KnowledgeNode) => {
    setSelectedKnowledge(knowledge);
  }, []);

  // 开始测试
  const handleStartQuiz = useCallback((knowledge: KnowledgeNode) => {
    setQuizKnowledge(knowledge);
    setIsQuizOpen(true);
  }, []);

  // 测试完成
  const handleQuizComplete = useCallback((score: number, total: number) => {
    console.log(`测试完成: ${score}/${total}`);
    setIsQuizOpen(false);
    setQuizKnowledge(null);
  }, []);

  return (
    <div className="app">
      <div className="graph-container">
        <KnowledgeGraph onNodeClick={handleNodeClick} />
      </div>
      
      <div className="detail-container">
        <KnowledgeDetail 
          knowledge={selectedKnowledge}
          onStartQuiz={handleStartQuiz}
        />
      </div>
      
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        knowledge={quizKnowledge}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
}

export default App;
```

## 🔧 配置选项

### 环境变量

```bash
# Google AI API Key (必需)
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here

# 或者使用这个变量名
GOOGLE_API_KEY=your_api_key_here

# 开发模式配置
NODE_ENV=development

# Next.js 配置
NEXT_TELEMETRY_DISABLED=1
```

### AI 服务配置

```typescript
// 在 aiService.ts 中可以调整的配置
const CONFIG = {
  MODEL_NAME: 'gemini-1.5-flash',     // AI 模型名称
  MAX_RETRIES: 3,                     // 最大重试次数
  TIMEOUT: 30000,                     // 超时时间 (毫秒)
  DEFAULT_QUESTION_COUNT: 3,          // 默认题目数量
  PASSING_SCORE: 70,                  // 及格分数
};
```

### React Flow 配置

```typescript
// 在 KnowledgeGraph.tsx 中的配置选项
const REACT_FLOW_CONFIG = {
  nodesDraggable: true,               // 节点可拖拽
  nodesConnectable: false,            // 节点不可连接
  elementsSelectable: true,           // 元素可选择
  fitView: true,                      // 自适应视图
  minZoom: 0.1,                       // 最小缩放
  maxZoom: 2,                         // 最大缩放
};
```

---

**此 API 文档将随着项目功能的扩展而持续更新，确保开发者能够准确理解和使用所有接口。**
