# 开发指南 - TypeScript 知识图谱学习应用

本文档专为使用大模型进行开发提供详细的项目信息和开发指导。

## 🎯 项目概述

### 核心功能

1. **交互式知识图谱**：使用 React Flow 展示 TypeScript 学习路径
2. **AI 智能测试**：基于 Google Gemini 生成个性化测试题
3. **学习进度管理**：本地存储学习状态和掌握情况
4. **内容管理系统**：Markdown 渲染的知识点详情

### 技术架构

- **前端**：Next.js 15 + React 19 + TypeScript
- **UI**：Tailwind CSS + DaisyUI + React Flow
- **AI**：LangChain + Google Gemini
- **存储**：浏览器 localStorage

## 📁 详细项目结构

```
knowledge-graph-app/
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git 忽略文件
├── README.md                    # 项目说明文档
├── DEVELOPMENT.md               # 开发指南（本文档）
├── package.json                 # 项目依赖和脚本
├── next.config.ts               # Next.js 配置
├── tailwind.config.js           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
├── eslint.config.mjs            # ESLint 配置
├── postcss.config.mjs           # PostCSS 配置
├── public/                      # 静态资源
│   ├── next.svg
│   ├── vercel.svg
│   └── ...
└── src/                         # 源代码目录
    ├── app/                     # Next.js App Router
    │   ├── favicon.ico          # 网站图标
    │   ├── globals.css          # 全局样式
    │   ├── layout.tsx           # 根布局组件
    │   ├── page.tsx             # 主页面组件
    │   └── test/                # 测试页面（可选）
    ├── components/              # React 组件
    │   ├── KnowledgeGraph.tsx   # 知识图谱主组件
    │   ├── KnowledgeDetail.tsx  # 知识点详情组件
    │   ├── QuizModal.tsx        # 测试弹窗组件
    │   └── MarkdownTest.tsx     # Markdown 测试组件
    ├── data/                    # 数据文件
    │   └── knowledgeData.ts     # 知识图谱数据定义
    ├── services/                # 服务层
    │   ├── aiService.ts         # AI 服务（Google Gemini）
    │   └── masteryService.ts    # 学习进度管理服务
    └── types/                   # TypeScript 类型定义
        └── knowledge.ts         # 知识图谱相关类型
```

## 🔧 核心组件详解

### 1. KnowledgeGraph 组件

**文件位置**：`src/components/KnowledgeGraph.tsx`

**主要功能**：

- 使用 React Flow 渲染知识图谱
- 处理节点拖拽、缩放、平移交互
- 集成学习进度显示
- 管理节点点击事件

**关键代码结构**：

```typescript
// 节点类型定义
const nodeTypes = {
  knowledgeNode: KnowledgeNode
};

// 自定义节点组件
const KnowledgeNode = React.memo(({ data }: NodeProps) => {
  // 节点渲染逻辑
  // 包含掌握状态显示
  // Handle 组件用于连接线
});

// 主组件
function KnowledgeGraph({ onNodeClick }: Props) {
  // React Flow 配置
  // 节点和边的数据处理
  // 交互事件处理
}
```

**重要特性**：

- 使用 `React.memo` 优化性能
- 支持节点掌握状态的视觉反馈
- 集成 Handle 组件用于边连接
- 响应式布局适配

### 2. KnowledgeDetail 组件

**文件位置**：`src/components/KnowledgeDetail.tsx`

**主要功能**：

- 显示知识点详细内容
- Markdown 内容渲染
- 代码高亮显示
- 提供测试入口

**关键依赖**：

- `react-markdown`：Markdown 渲染
- `remark-gfm`：GitHub 风格 Markdown 支持

### 3. QuizModal 组件

**文件位置**：`src/components/QuizModal.tsx`

**主要功能**：

- AI 生成测试题目
- 交互式答题界面
- 实时结果反馈
- 自动更新掌握状态

**工作流程**：

1. 调用 AI 服务生成题目
2. 渲染答题界面
3. 处理用户答题
4. 显示结果和解释
5. 更新学习进度

## 🤖 AI 服务详解

### AIService 类

**文件位置**：`src/services/aiService.ts`

**核心方法**：

```typescript
class AIService {
  // 初始化 Google Gemini 模型
  private initializeModel(): void
  
  // 生成测试题目
  async generateQuiz(knowledge: KnowledgeNode, questionCount: number): Promise<QuizData>
  
  // 创建 AI 提示词
  private createQuizPrompt(knowledge: KnowledgeNode, questionCount: number): string
  
  // 解析 AI 响应
  private parseQuizResponse(response: string): QuizData
  
  // 提供备用题目（当 AI 不可用时）
  private getFallbackQuiz(knowledge: KnowledgeNode): QuizData
}
```

**提示词模板**：

```typescript
const prompt = `基于以下 TypeScript 知识点生成 ${questionCount} 道选择题：

${knowledge.content}

要求：
1. 题目要有实际意义和应用价值
2. 选项要有迷惑性但答案明确
3. 提供详细的解释说明
4. 返回标准 JSON 格式

返回格式：
{
  "questions": [
    {
      "id": "unique_id",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": 0,
      "explanation": "详细解释"
    }
  ],
  "totalQuestions": ${questionCount}
}`;
```

## 💾 数据管理

### 知识图谱数据

**文件位置**：`src/data/knowledgeData.ts`

**数据结构**：

```typescript
export const knowledgeGraph: KnowledgeGraph = {
  nodes: [
    {
      id: 'unique-id',
      title: '知识点标题',
      description: '简短描述',
      category: 'basic' | 'advanced' | 'practical',
      level: 1-7, // 难度等级
      prerequisites: ['前置知识点ID'],
      content: '详细内容（Markdown格式）',
      examples: ['代码示例'],
      position: { x: 100, y: 100 } // 图谱中的位置
    }
  ],
  edges: [
    {
      id: 'edge-id',
      source: '源节点ID',
      target: '目标节点ID',
      type: 'prerequisite' | 'related' | 'extends'
    }
  ]
};
```

### 学习进度管理

**文件位置**：`src/services/masteryService.ts`

**核心功能**：

- 本地存储学习状态
- 掌握状态的增删改查
- 数据持久化和恢复

**存储格式**：

```typescript
interface MasteryState {
  nodeId: string;
  isMastered: boolean;
  masteredAt: Date;
  quizScore?: number;
  quizAttempts?: number;
}
```

## 🎨 样式系统

### Tailwind CSS 配置

**文件位置**：`tailwind.config.js`

**关键配置**：

```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 自定义主题扩展
    }
  },
  plugins: [require('daisyui')]
};
```

### 组件样式约定

- 使用 Tailwind 实用类
- DaisyUI 组件库补充
- 响应式设计优先
- 深色模式支持（可扩展）

## 🔄 开发工作流

### 添加新知识点

1. **编辑数据文件**：在 `knowledgeData.ts` 中添加新节点
2. **设置依赖关系**：添加相应的边连接
3. **调整布局**：设置合适的位置坐标
4. **测试验证**：确保图谱渲染正常

### 修改 AI 提示词

1. **定位文件**：`src/services/aiService.ts`
2. **修改方法**：`createQuizPrompt`
3. **测试生成**：验证题目质量
4. **调整参数**：优化题目数量和难度

### 样式定制

1. **全局样式**：修改 `app/globals.css`
2. **组件样式**：使用 Tailwind 类
3. **主题配置**：调整 `tailwind.config.js`
4. **响应式适配**：确保移动端兼容

## 🐛 常见问题和解决方案

### 1. React Flow 警告

**问题**：`nodeTypes` 或 `edgeTypes` 重新创建警告
**解决**：将类型定义移到组件外部，使用 `React.memo` 优化

### 2. AI 服务不可用

**问题**：Google API Key 未配置或网络问题
**解决**：提供备用题目，优雅降级

### 3. 本地存储问题

**问题**：数据丢失或格式错误
**解决**：添加数据验证和错误处理

### 4. 性能优化

**问题**：大量节点时渲染缓慢
**解决**：使用 `React.memo`、`useMemo`、`useCallback`

## 📊 性能监控

### 关键指标

- 首屏加载时间
- 节点渲染性能
- AI 响应时间
- 内存使用情况

### 优化策略

- 组件懒加载
- 图片资源优化
- 代码分割
- 缓存策略

## 🧪 测试策略

### 单元测试

- 组件渲染测试
- 服务功能测试
- 工具函数测试

### 集成测试

- 用户交互流程
- AI 服务集成
- 数据持久化

### E2E 测试

- 完整学习流程
- 跨浏览器兼容性
- 响应式布局

## 🚀 部署指南

### 环境变量配置

```bash
# 生产环境
NEXT_PUBLIC_GOOGLE_API_KEY=prod_api_key
NODE_ENV=production

# 开发环境
NEXT_PUBLIC_GOOGLE_API_KEY=dev_api_key
NODE_ENV=development
```

### 构建优化

- 启用 Turbopack（开发）
- 代码压缩和混淆
- 静态资源优化
- CDN 配置

## 📈 扩展方向

### 功能扩展

1. **多语言支持**：国际化配置
2. **用户系统**：登录注册和云端同步
3. **社交功能**：学习分享和讨论
4. **统计分析**：学习数据可视化

### 技术升级

1. **数据库集成**：替换本地存储
2. **实时协作**：WebSocket 支持
3. **移动应用**：React Native 版本
4. **AI 增强**：更多 AI 功能集成

## 🤝 贡献指南

### 代码规范

- TypeScript 严格模式
- ESLint + Prettier
- 组件命名约定
- 提交信息规范

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request
5. 代码审查和合并

---

**此文档将随项目发展持续更新，确保为大模型开发提供最准确的指导信息。**
