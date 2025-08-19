# Cloudflare Pages 部署指南

本文档详细说明如何将 Knowledge Graph App 部署到 Cloudflare Pages。

## 📋 部署前准备

### 1. 环境要求

- Node.js 18+ 
- npm 或 yarn
- Git 仓库（GitHub/GitLab）
- Cloudflare 账户

### 2. 必需的 API 密钥

在部署前，请确保已获取以下 API 密钥：

- **Google Generative AI API 密钥**
  - 获取地址: https://makersuite.google.com/app/apikey
  - 用于 Google AI 功能

- **Kimi API 密钥** (可选)
  - 获取地址: https://platform.moonshot.cn/console/api-keys
  - 用于月之暗面 AI 功能

## 🚀 部署步骤

### 步骤 1: 准备代码

1. 确保所有代码已提交到 Git 仓库
2. 检查 `next.config.ts` 配置是否正确
3. 验证所有 API 路由都已添加 `export const runtime = 'edge';`

### 步骤 2: 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权并选择你的 Git 仓库

### 步骤 3: 配置构建设置

在项目设置中配置以下构建参数：

```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (留空)
```

### 步骤 4: 设置环境变量

在 Cloudflare Pages 控制台中设置环境变量：

#### 生产环境 (Production)

```bash
# 必需变量
GOOGLE_API_KEY=your_google_api_key_here
KIMI_API_KEY=your_kimi_api_key_here

# 运行时配置
NODE_ENV=production
NEXT_RUNTIME=edge

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-app.pages.dev
NEXT_PUBLIC_API_URL=https://your-app.pages.dev/api

# 功能配置
ENABLE_ANALYTICS=true
DEBUG=false
ENABLE_CACHE=true
CACHE_TTL=3600

# 安全配置
API_TIMEOUT=30000
LOG_LEVEL=info
```

#### 预览环境 (Preview)

```bash
# 必需变量 (可以使用测试密钥)
GOOGLE_API_KEY=your_test_google_api_key
KIMI_API_KEY=your_test_kimi_api_key

# 运行时配置
NODE_ENV=development
NEXT_RUNTIME=edge

# 应用配置
NEXT_PUBLIC_APP_URL=https://preview-branch.your-app.pages.dev
NEXT_PUBLIC_API_URL=https://preview-branch.your-app.pages.dev/api

# 功能配置
ENABLE_ANALYTICS=false
DEBUG=true
ENABLE_CACHE=false
LOG_LEVEL=debug
```

### 步骤 5: 部署

1. 点击 **Save and Deploy**
2. Cloudflare Pages 将自动构建和部署你的应用
3. 部署完成后，你将获得一个 `.pages.dev` 域名

## 🔧 配置说明

### Next.js 配置

项目已配置为支持 Cloudflare Pages：

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // ... 其他 Cloudflare 兼容配置
}
```

### API 路由配置

所有 API 路由都已配置为使用 Edge Runtime：

```typescript
export const runtime = 'edge';
```

### 代理配置

代码已自动检测 Cloudflare 环境并跳过代理配置：

```typescript
// 仅在非 Cloudflare 环境中使用代理
const isCloudflare = process.env.CF_PAGES === '1';
if (!isCloudflare && process.env.HTTPS_PROXY) {
  // 使用代理配置
}
```

## 🧪 测试部署

### 健康检查

部署完成后，访问以下端点验证应用状态：

```bash
# 基本健康检查
GET https://your-app.pages.dev/api/health

# 测试简单功能
POST https://your-app.pages.dev/api/test-simple
Content-Type: application/json
{
  "message": "Hello Cloudflare!"
}

# 测试 AI 功能 (需要 API 密钥)
POST https://your-app.pages.dev/api/test-ai
Content-Type: application/json
{
  "prompt": "Hello, how are you?"
}
```

### 本地测试

在部署前，可以本地测试 Cloudflare 兼容性：

```bash
# 安装依赖
npm install

# 设置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入实际值

# 本地开发
npm run dev

# 构建测试
npm run build
npm start
```

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本是否为 18+
   - 确保所有依赖都已正确安装
   - 查看构建日志中的具体错误信息

2. **API 调用失败**
   - 验证环境变量是否正确设置
   - 检查 API 密钥是否有效
   - 确认 API 路由使用了 Edge Runtime

3. **代理相关错误**
   - 确认代码已正确检测 Cloudflare 环境
   - 验证 `HttpsProxyAgent` 相关代码已被条件化

4. **静态资源问题**
   - 检查 `next.config.ts` 中的 `images.unoptimized` 设置
   - 确认 `output: 'export'` 配置正确

### 调试方法

1. **查看构建日志**
   - 在 Cloudflare Pages 控制台查看详细构建日志
   - 关注错误和警告信息

2. **检查运行时日志**
   - 使用 Cloudflare Pages 的实时日志功能
   - 在代码中添加 `console.log` 进行调试

3. **本地模拟**
   - 设置 `CF_PAGES=1` 环境变量模拟 Cloudflare 环境
   - 使用 `NODE_ENV=production` 测试生产配置

## 📚 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js Cloudflare 部署指南](https://nextjs.org/docs/deployment#cloudflare-pages)
- [Edge Runtime 文档](https://nextjs.org/docs/api-reference/edge-runtime)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

## 🔄 持续部署

Cloudflare Pages 支持自动部署：

- **主分支推送** → 自动部署到生产环境
- **其他分支推送** → 自动部署到预览环境
- **Pull Request** → 自动创建预览部署

每次部署都会生成唯一的 URL，方便测试和回滚。

## 🛡️ 安全注意事项

1. **API 密钥管理**
   - 永远不要在代码中硬编码 API 密钥
   - 使用 Cloudflare Pages 环境变量功能
   - 定期轮换 API 密钥

2. **CORS 配置**
   - 根据实际需求配置 CORS 策略
   - 避免使用 `*` 作为生产环境的 CORS 源

3. **错误处理**
   - 不要在错误响应中暴露敏感信息
   - 使用适当的 HTTP 状态码

## 📈 性能优化

1. **缓存策略**
   - 利用 Cloudflare 的全球 CDN
   - 配置适当的缓存头
   - 使用 Edge Runtime 减少冷启动时间

2. **资源优化**
   - 启用图片优化（如果需要）
   - 使用代码分割减少包大小
   - 压缩静态资源

3. **监控**
   - 使用 Cloudflare Analytics
   - 设置性能监控和告警
   - 定期检查应用性能指标