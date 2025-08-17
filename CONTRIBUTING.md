# 贡献指南 - TypeScript 知识图谱学习应用

感谢您对本项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、设计、测试和反馈。

## 📋 目录

- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题报告](#问题报告)
- [功能请求](#功能请求)
- [代码审查](#代码审查)
- [社区准则](#社区准则)

## 🤝 如何贡献

### 贡献类型

1. **代码贡献**
   - 修复 Bug
   - 添加新功能
   - 性能优化
   - 重构代码

2. **文档贡献**
   - 改进 README
   - 添加 API 文档
   - 编写教程
   - 翻译文档

3. **设计贡献**
   - UI/UX 改进
   - 图标设计
   - 交互优化
   - 可访问性改进

4. **测试贡献**
   - 编写单元测试
   - 添加集成测试
   - 性能测试
   - 用户体验测试

5. **其他贡献**
   - 问题报告
   - 功能建议
   - 社区支持
   - 推广宣传

## 💻 开发环境设置

### 前置要求

- Node.js >= 18.17.0
- npm >= 9.0.0 或 yarn >= 1.22.0
- Git >= 2.20.0
- 代码编辑器（推荐 VS Code）

### 快速开始

```bash
# 1. Fork 项目到你的 GitHub 账户

# 2. 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/knowledge-graph-app.git
cd knowledge-graph-app

# 3. 添加上游仓库
git remote add upstream https://github.com/ORIGINAL_OWNER/knowledge-graph-app.git

# 4. 安装依赖
npm install

# 5. 复制环境变量文件
cp .env.example .env.local
# 编辑 .env.local，添加你的 Google API Key

# 6. 启动开发服务器
npm run dev
```

### VS Code 配置

推荐安装以下扩展：

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

工作区设置：

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 📝 代码规范

### TypeScript 规范

1. **类型定义**

   ```typescript
   // ✅ 好的做法
   interface User {
     id: string;
     name: string;
     email: string;
   }
   
   // ❌ 避免使用 any
   const user: any = getData();
   
   // ✅ 使用具体类型
   const user: User = getData();
   ```

2. **函数定义**

   ```typescript
   // ✅ 明确的参数和返回类型
   function calculateScore(answers: number[], total: number): number {
     return (answers.length / total) * 100;
   }
   
   // ✅ 使用箭头函数（简单函数）
   const formatDate = (date: Date): string => {
     return date.toISOString().split('T')[0];
   };
   ```

3. **组件定义**

   ```typescript
   // ✅ 使用接口定义 Props
   interface ButtonProps {
     children: React.ReactNode;
     onClick: () => void;
     variant?: 'primary' | 'secondary';
     disabled?: boolean;
   }
   
   // ✅ 使用 React.FC 或直接函数
   const Button: React.FC<ButtonProps> = ({ 
     children, 
     onClick, 
     variant = 'primary',
     disabled = false 
   }) => {
     return (
       <button 
         className={`btn btn-${variant}`}
         onClick={onClick}
         disabled={disabled}
       >
         {children}
       </button>
     );
   };
   ```

### React 规范

1. **Hooks 使用**

   ```typescript
   // ✅ 自定义 Hook
   function useLocalStorage<T>(key: string, initialValue: T) {
     const [storedValue, setStoredValue] = useState<T>(() => {
       try {
         const item = window.localStorage.getItem(key);
         return item ? JSON.parse(item) : initialValue;
       } catch (error) {
         return initialValue;
       }
     });
   
     const setValue = (value: T | ((val: T) => T)) => {
       try {
         const valueToStore = value instanceof Function ? value(storedValue) : value;
         setStoredValue(valueToStore);
         window.localStorage.setItem(key, JSON.stringify(valueToStore));
       } catch (error) {
         console.error('Error saving to localStorage:', error);
       }
     };
   
     return [storedValue, setValue] as const;
   }
   ```

2. **性能优化**

   ```typescript
   // ✅ 使用 React.memo
   const ExpensiveComponent = React.memo<Props>(({ data }) => {
     return <div>{/* 复杂渲染逻辑 */}</div>;
   });
   
   // ✅ 使用 useCallback
   const handleClick = useCallback((id: string) => {
     onItemClick(id);
   }, [onItemClick]);
   
   // ✅ 使用 useMemo
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   ```

### 样式规范

1. **Tailwind CSS**

   ```typescript
   // ✅ 使用语义化的类名组合
   const cardClasses = [
     'bg-white',
     'rounded-lg',
     'shadow-md',
     'p-6',
     'hover:shadow-lg',
     'transition-shadow',
     'duration-200'
   ].join(' ');
   
   // ✅ 响应式设计
   <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
     {/* 内容 */}
   </div>
   ```

2. **条件样式**

   ```typescript
   // ✅ 使用 clsx 或类似工具
   import clsx from 'clsx';
   
   const buttonClasses = clsx(
     'px-4 py-2 rounded font-medium',
     {
       'bg-blue-500 text-white': variant === 'primary',
       'bg-gray-200 text-gray-800': variant === 'secondary',
       'opacity-50 cursor-not-allowed': disabled,
     }
   );
   ```

### 文件组织

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础 UI 组件
│   ├── forms/          # 表单组件
│   └── layout/         # 布局组件
├── hooks/              # 自定义 Hooks
├── utils/              # 工具函数
├── types/              # 类型定义
├── services/           # 服务层
├── data/               # 静态数据
└── app/                # Next.js App Router
```

### 命名规范

1. **文件命名**
   - 组件文件：`PascalCase.tsx`
   - 工具文件：`camelCase.ts`
   - 类型文件：`camelCase.ts`
   - 常量文件：`UPPER_SNAKE_CASE.ts`

2. **变量命名**

   ```typescript
   // ✅ 变量和函数：camelCase
   const userName = 'john';
   const calculateTotal = () => {};
   
   // ✅ 常量：UPPER_SNAKE_CASE
   const API_BASE_URL = 'https://api.example.com';
   const MAX_RETRY_COUNT = 3;
   
   // ✅ 组件：PascalCase
   const UserProfile = () => {};
   
   // ✅ 接口和类型：PascalCase
   interface UserData {}
   type ApiResponse = {};
   ```

## 📤 提交规范

### Commit Message 格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 相关
- `build`: 构建系统相关

### 提交示例

```bash
# 新功能
git commit -m "feat(quiz): add AI-generated quiz questions"

# Bug 修复
git commit -m "fix(graph): resolve node positioning issue"

# 文档更新
git commit -m "docs: update API documentation"

# 重构
git commit -m "refactor(services): extract common API logic"

# 性能优化
git commit -m "perf(graph): optimize node rendering with React.memo"
```

### 提交最佳实践

1. **原子性提交**：每个提交只包含一个逻辑变更
2. **清晰的描述**：简洁但完整地描述变更内容
3. **关联问题**：在提交信息中引用相关的 Issue
4. **测试验证**：确保提交的代码通过所有测试

## 🔄 Pull Request 流程

### 创建 PR 前

1. **同步上游代码**

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **创建功能分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **开发和测试**

   ```bash
   # 开发你的功能
   # 运行测试
   npm run test
   npm run lint
   npm run type-check
   ```

4. **提交变更**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### PR 模板

创建 PR 时，请使用以下模板：

```markdown
## 变更描述
简要描述这个 PR 的目的和实现的功能。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他（请说明）

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成
- [ ] 添加了新的测试用例

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自我审查了代码变更
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有引入新的警告
- [ ] 测试覆盖了新的代码路径

## 截图（如适用）
如果有 UI 变更，请提供截图。

## 相关 Issue
Closes #issue_number
```

### PR 审查标准

1. **代码质量**
   - 遵循项目代码规范
   - 没有明显的 Bug
   - 性能考虑合理
   - 错误处理完善

2. **测试覆盖**
   - 新功能有对应测试
   - 测试用例覆盖边界情况
   - 所有测试通过

3. **文档完整**
   - 代码注释清晰
   - API 文档更新
   - README 更新（如需要）

4. **向后兼容**
   - 不破坏现有 API
   - 数据迁移方案（如需要）
   - 版本兼容性考虑

## 🐛 问题报告

### 报告 Bug

使用 [Issue 模板](https://github.com/your-repo/issues/new?template=bug_report.md) 报告 Bug：

```markdown
## Bug 描述
清晰简洁地描述 Bug。

## 复现步骤
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 期望行为
描述你期望发生的行为。

## 实际行为
描述实际发生的行为。

## 截图
如果适用，添加截图来帮助解释问题。

## 环境信息
- 操作系统: [e.g. macOS 12.0]
- 浏览器: [e.g. Chrome 95.0]
- Node.js 版本: [e.g. 18.17.0]
- 项目版本: [e.g. 1.0.0]

## 附加信息
添加任何其他相关信息。
```

### 安全问题

如果发现安全漏洞，请不要公开报告。请发送邮件到 [security@example.com](mailto:security@example.com)。

## 💡 功能请求

使用 [功能请求模板](https://github.com/your-repo/issues/new?template=feature_request.md)：

```markdown
## 功能描述
清晰简洁地描述你想要的功能。

## 问题背景
描述这个功能要解决的问题。

## 解决方案
描述你希望的解决方案。

## 替代方案
描述你考虑过的其他替代方案。

## 附加信息
添加任何其他相关信息或截图。
```

## 👀 代码审查

### 审查者指南

1. **关注点**
   - 代码逻辑正确性
   - 性能影响
   - 安全性考虑
   - 可维护性
   - 测试覆盖率

2. **审查流程**
   - 理解 PR 目的
   - 检查代码变更
   - 运行测试
   - 提供建设性反馈
   - 批准或请求修改

3. **反馈原则**
   - 具体明确
   - 建设性
   - 及时响应
   - 尊重贡献者

### 被审查者指南

1. **响应反馈**
   - 及时回复评论
   - 解释设计决策
   - 积极修改问题
   - 感谢审查者

2. **自我审查**
   - 提交前自己先审查
   - 确保代码质量
   - 添加必要注释
   - 更新相关文档

## 🌟 社区准则

### 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境，无论：

- 性别、性别认同和表达
- 性取向
- 残疾
- 外貌
- 身体大小
- 种族
- 年龄
- 宗教
- 国籍

### 期望行为

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不当行为

- 使用性化的语言或图像
- 恶意评论、侮辱或人身攻击
- 公开或私下骚扰
- 未经许可发布他人私人信息
- 其他在专业环境中不当的行为

### 执行

如果遇到不当行为，请联系项目维护者。所有投诉都会被审查和调查。

## 🎯 贡献者等级

### 新手贡献者

- 修复文档错误
- 改进代码注释
- 添加测试用例
- 报告 Bug

### 经验贡献者

- 实现新功能
- 重构代码
- 性能优化
- 架构改进

### 核心贡献者

- 代码审查
- 技术决策
- 发布管理
- 社区管理

## 📚 学习资源

### 技术文档

- [React 官方文档](https://react.dev/)
- [Next.js 文档](https://nextjs.org/docs)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

### 最佳实践

- [React 最佳实践](https://react.dev/learn/thinking-in-react)
- [TypeScript 最佳实践](https://typescript-eslint.io/rules/)
- [Git 工作流](https://www.atlassian.com/git/tutorials/comparing-workflows)

## 🙏 致谢

感谢所有为这个项目做出贡献的人！你们的努力让这个项目变得更好。

### 贡献者列表
<!-- 这里会自动生成贡献者列表 -->

---

**再次感谢您的贡献！如果有任何问题，请随时在 Issues 中提问或联系维护者。**
