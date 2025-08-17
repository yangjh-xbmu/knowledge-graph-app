# TypeScript 知识图谱学习应用

一个基于 React Flow 构建的交互式 TypeScript 学习平台，通过可视化知识图谱和 AI 生成的测试题帮助开发者系统性学习 TypeScript。

## ✨ 功能特性

### 🗺️ 交互式知识图谱

- **可视化学习路径**：清晰展示 TypeScript 知识点之间的依赖关系
- **分层级学习**：从基础到高级，循序渐进的学习体系
- **实时交互**：点击节点查看详细内容，支持拖拽和缩放
- **学习进度追踪**：已掌握的知识点会有视觉标识

### 📚 丰富的学习内容

- **完整知识体系**：涵盖 TypeScript 从入门到进阶的所有核心概念
- **实用代码示例**：每个知识点都配有实际代码演示
- **Markdown 渲染**：支持代码高亮和格式化显示
- **分类管理**：基础、进阶、实践三大类别

### 🤖 AI 智能测试

- **动态题目生成**：基于 Google Gemini AI 生成个性化测试题
- **自适应数量**：根据知识点复杂度智能调整题目数量
- **即时反馈**：答题后立即显示正确答案和详细解释
- **掌握状态管理**：通过测试自动标记知识点掌握状态

### 💾 数据持久化

- **本地存储**：学习进度自动保存到浏览器本地存储
- **状态恢复**：刷新页面后自动恢复学习进度
- **跨会话保持**：关闭浏览器后重新打开仍保持学习状态

## 🛠️ 技术栈

### 前端框架

- **Next.js 15.4.6** - React 全栈框架，支持 Turbopack
- **React 19.1.0** - 用户界面构建库
- **TypeScript 5** - 类型安全的 JavaScript 超集

### UI 组件与样式

- **React Flow 11.11.4** - 强大的图形可视化库
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **DaisyUI 5.0.50** - 基于 Tailwind 的组件库

### AI 集成

- **LangChain 0.3.30** - AI 应用开发框架
- **@langchain/google-genai 0.2.16** - Google Gemini AI 集成

### 内容渲染

- **react-markdown 10.1.0** - Markdown 内容渲染
- **remark-gfm 4.0.1** - GitHub 风格 Markdown 支持

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun 包管理器

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd knowledge-graph-app
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **配置环境变量**

```bash
# 创建 .env.local 文件
cp .env.example .env.local

# 编辑 .env.local，添加 Google AI API Key
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_ai_api_key_here
```

4. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

5. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用指南

### 基本操作

1. **浏览知识图谱**：在主界面查看完整的 TypeScript 学习路径
2. **查看知识点**：点击任意节点查看详细内容和代码示例
3. **开始测试**：在知识点详情页点击"开始测试"按钮
4. **完成测试**：回答所有问题后查看结果和解释
5. **追踪进度**：已掌握的知识点会在图谱中高亮显示

### 学习建议

- 按照依赖关系从基础知识点开始学习
- 仔细阅读每个知识点的内容和示例
- 通过测试验证理解程度
- 定期回顾已掌握的知识点

## 🔧 开发指南

### 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── KnowledgeGraph.tsx # 知识图谱组件
│   ├── KnowledgeDetail.tsx# 知识点详情组件
│   └── QuizModal.tsx      # 测试弹窗组件
├── data/                  # 数据文件
│   └── knowledgeData.ts   # 知识图谱数据
├── services/              # 服务层
│   ├── aiService.ts       # AI 服务
│   └── masteryService.ts  # 掌握状态服务
└── types/                 # TypeScript 类型定义
    └── knowledge.ts       # 知识图谱相关类型
```

### 核心组件说明

#### KnowledgeGraph 组件

- 使用 React Flow 渲染知识图谱
- 支持节点拖拽、缩放、平移
- 集成掌握状态显示
- 处理节点点击事件

#### KnowledgeDetail 组件

- 显示知识点详细内容
- 支持 Markdown 渲染和代码高亮
- 提供测试入口
- 展示学习进度

#### QuizModal 组件

- AI 生成测试题目
- 交互式答题界面
- 实时结果反馈
- 自动更新掌握状态

### 数据结构

#### KnowledgeNode 接口

```typescript
interface KnowledgeNode {
  id: string;                    // 唯一标识
  title: string;                 // 标题
  description: string;           // 描述
  category: 'basic' | 'advanced' | 'practical'; // 分类
  level: number;                 // 难度等级
  prerequisites: string[];       // 前置知识点
  content: string;               // 详细内容（Markdown）
  examples: string[];            // 代码示例
  position: { x: number; y: number }; // 图谱位置
  isMastered?: boolean;          // 是否已掌握
  masteredAt?: Date;             // 掌握时间
}
```

### 添加新知识点

1. **编辑数据文件**

```typescript
// src/data/knowledgeData.ts
export const knowledgeGraph: KnowledgeGraph = {
  nodes: [
    // 添加新的知识点
    {
      id: 'new-concept',
      title: '新概念',
      description: '概念描述',
      category: 'basic',
      level: 1,
      prerequisites: [],
      content: `# 新概念\n\n详细内容...`,
      examples: ['代码示例'],
      position: { x: 100, y: 100 }
    }
  ],
  edges: [
    // 添加依赖关系
    { id: 'e-new', source: 'prerequisite-id', target: 'new-concept', type: 'prerequisite' }
  ]
};
```

2. **更新图谱布局**

- 调整新节点的 position 坐标
- 确保不与现有节点重叠
- 保持合理的视觉层次

### AI 服务配置

#### 获取 Google AI API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API Key
3. 将 API Key 添加到环境变量

#### 自定义 AI 提示词

```typescript
// src/services/aiService.ts
private createQuizPrompt(knowledge: KnowledgeNode, questionCount: number): string {
  return `基于以下 TypeScript 知识点生成 ${questionCount} 道选择题：

${knowledge.content}

要求：
1. 题目要有实际意义和应用价值
2. 选项要有迷惑性但答案明确
3. 提供详细的解释说明
4. 返回标准 JSON 格式`;
}
```

### 样式定制

#### Tailwind CSS 配置

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 自定义颜色
      }
    }
  },
  plugins: [require('daisyui')]
};
```

#### 知识点状态样式

```css
/* 已掌握状态 */
.mastered-node {
  @apply bg-green-100 border-green-500 text-green-800;
}

/* 学习中状态 */
.learning-node {
  @apply bg-blue-100 border-blue-500 text-blue-800;
}
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm test -- --watch

# 生成测试覆盖率报告
npm test -- --coverage
```

### 测试结构

```
__tests__/
├── components/           # 组件测试
├── services/            # 服务测试
└── utils/               # 工具函数测试
```

## 📦 构建部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 编写有意义的提交信息
- 为新功能添加测试

### 问题反馈

- 使用 GitHub Issues 报告 Bug
- 提供详细的复现步骤
- 包含环境信息和错误日志

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [React Flow](https://reactflow.dev/) - 强大的图形可视化库
- [Next.js](https://nextjs.org/) - 优秀的 React 框架
- [Google AI](https://ai.google.dev/) - AI 能力支持
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues: [项目问题追踪](https://github.com/your-username/knowledge-graph-app/issues)
- Email: your-email@example.com

---

**开始你的 TypeScript 学习之旅吧！** 🚀
