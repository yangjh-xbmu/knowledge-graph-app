# 部署指南 - TypeScript 知识图谱学习应用

本文档提供了在不同环境中部署应用的详细指南。

## 📋 目录

- [环境要求](#环境要求)
- [环境变量配置](#环境变量配置)
- [本地开发部署](#本地开发部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)

## 🔧 环境要求

### 基础要求

- **Node.js**: >= 18.17.0
- **npm**: >= 9.0.0 或 **yarn**: >= 1.22.0 或 **pnpm**: >= 8.0.0
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

### 推荐配置

- **Node.js**: 20.x LTS
- **内存**: >= 4GB RAM
- **存储**: >= 1GB 可用空间
- **网络**: 稳定的互联网连接（用于 AI API 调用）

### 检查环境

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查系统信息
node -p "process.platform + ' ' + process.arch"
```

## 🔐 环境变量配置

### 必需的环境变量

#### Google AI API Key

```bash
# 方式1：使用 NEXT_PUBLIC_ 前缀（推荐）
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_ai_api_key_here

# 方式2：服务端环境变量
GOOGLE_API_KEY=your_google_ai_api_key_here
```

**获取 API Key 步骤：**

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账户
3. 创建新的 API Key
4. 复制 API Key 到环境变量

### 可选的环境变量

```bash
# 环境标识
NODE_ENV=production

# Next.js 配置
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_VERCEL_URL=your-domain.com

# 应用配置
NEXT_PUBLIC_APP_NAME="TypeScript 知识图谱"
NEXT_PUBLIC_APP_VERSION=1.0.0

# 调试配置
DEBUG=false
LOG_LEVEL=info
```

### 环境变量文件

#### 开发环境 (.env.local)

```bash
# 开发环境配置
NODE_ENV=development
NEXT_PUBLIC_GOOGLE_API_KEY=your_dev_api_key
DEBUG=true
LOG_LEVEL=debug
```

#### 生产环境 (.env.production)

```bash
# 生产环境配置
NODE_ENV=production
NEXT_PUBLIC_GOOGLE_API_KEY=your_prod_api_key
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=error
```

## 💻 本地开发部署

### 快速开始

```bash
# 1. 克隆项目
git clone <repository-url>
cd knowledge-graph-app

# 2. 安装依赖
npm install
# 或者
yarn install
# 或者
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，添加你的 API Key

# 4. 启动开发服务器
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
```

### 开发服务器配置

```bash
# 默认配置
# 地址: http://localhost:3000
# 端口: 3000

# 自定义端口
PORT=8080 npm run dev

# 自定义主机
HOST=0.0.0.0 PORT=3000 npm run dev
```

### 开发工具

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check

# 构建测试
npm run build
```

## 🚀 生产环境部署

### 构建应用

```bash
# 1. 安装生产依赖
npm ci --only=production

# 2. 构建应用
npm run build

# 3. 启动生产服务器
npm start
```

### 生产环境优化

#### Next.js 配置 (next.config.ts)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 生产环境优化
  compress: true,
  poweredByHeader: false,
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // 实验性功能
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // 输出配置
  output: 'standalone', // 用于 Docker 部署
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
```

#### 性能监控

```bash
# 分析构建包大小
npm run analyze

# 性能测试
npm run lighthouse
```

## 🐳 Docker 部署

### Dockerfile

```dockerfile
# 多阶段构建
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建应用
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_GOOGLE_API_KEY=${GOOGLE_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 可选：添加 Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Docker 部署命令

```bash
# 构建镜像
docker build -t knowledge-graph-app .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key \
  knowledge-graph-app

# 使用 Docker Compose
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

## ▲ Vercel 部署

### 自动部署

1. **连接 GitHub**：
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 选择 GitHub 仓库

2. **配置环境变量**：
   - 在项目设置中添加环境变量
   - `NEXT_PUBLIC_GOOGLE_API_KEY`

3. **部署设置**：

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "devCommand": "npm run dev"
   }
   ```

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### Vercel 配置文件

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_GOOGLE_API_KEY": "@google-api-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🌐 Netlify 部署

### 自动部署

1. **连接 Git**：
   - 访问 [Netlify Dashboard](https://app.netlify.com/)
   - 点击 "New site from Git"
   - 选择仓库

2. **构建设置**：
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **环境变量**：
   - 在 Site settings > Environment variables 中添加
   - `NEXT_PUBLIC_GOOGLE_API_KEY`

### 手动部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 构建
npm run build

# 部署
netlify deploy

# 生产部署
netlify deploy --prod
```

### Netlify 配置文件

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "9"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## ⚡ 性能优化

### 构建优化

```bash
# 启用 Turbopack (开发)
npm run dev --turbo

# 分析包大小
npm run build -- --analyze

# 启用实验性功能
NEXT_EXPERIMENTAL_TURBO=1 npm run dev
```

### 运行时优化

```typescript
// next.config.ts 优化配置
const nextConfig: NextConfig = {
  // 压缩
  compress: true,
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 字体优化
  optimizeFonts: true,
  
  // 代码分割
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-flow-renderer'],
  },
};
```

### CDN 配置

```typescript
// 静态资源 CDN
const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.yourdomain.com' 
    : '',
  
  images: {
    loader: 'custom',
    loaderFile: './src/utils/imageLoader.ts',
  },
};
```

## 📊 监控和日志

### 健康检查端点

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  };
  
  return NextResponse.json(healthCheck);
}
```

### 日志配置

```typescript
// src/utils/logger.ts
const logger = {
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, meta);
    }
  },
  
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    
    // 生产环境发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 发送到 Sentry, LogRocket 等
    }
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta);
  },
};

export default logger;
```

### 性能监控

```typescript
// src/utils/analytics.ts
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Google Analytics
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

## 🔧 故障排除

### 常见问题

#### 1. API Key 相关

```bash
# 问题：AI 服务不可用
# 解决：检查环境变量
echo $NEXT_PUBLIC_GOOGLE_API_KEY

# 验证 API Key
curl -H "Authorization: Bearer $NEXT_PUBLIC_GOOGLE_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models
```

#### 2. 构建失败

```bash
# 清理缓存
npm run clean
rm -rf .next node_modules package-lock.json
npm install

# 检查 TypeScript 错误
npm run type-check

# 检查 ESLint 错误
npm run lint
```

#### 3. 运行时错误

```bash
# 查看详细日志
DEBUG=* npm run dev

# 检查端口占用
lsof -i :3000

# 检查内存使用
node --max-old-space-size=4096 node_modules/.bin/next dev
```

#### 4. Docker 相关

```bash
# 查看容器日志
docker logs container_name

# 进入容器调试
docker exec -it container_name sh

# 检查容器资源
docker stats container_name
```

### 调试工具

#### 开发环境调试

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### 生产环境调试

```bash
# 启用调试模式
DEBUG=next:* npm start

# 性能分析
node --inspect node_modules/.bin/next start

# 内存泄漏检测
node --inspect --max-old-space-size=4096 node_modules/.bin/next start
```

### 回滚策略

#### Vercel 回滚

```bash
# 查看部署历史
vercel ls

# 回滚到指定版本
vercel rollback [deployment-url]
```

#### Docker 回滚

```bash
# 标记镜像版本
docker tag knowledge-graph-app:latest knowledge-graph-app:v1.0.0

# 回滚到指定版本
docker-compose down
docker-compose up -d knowledge-graph-app:v1.0.0
```

## 📋 部署检查清单

### 部署前检查

- [ ] 环境变量已配置
- [ ] 代码已通过所有测试
- [ ] 构建成功无错误
- [ ] 性能测试通过
- [ ] 安全扫描通过
- [ ] 文档已更新

### 部署后验证

- [ ] 应用可正常访问
- [ ] 所有功能正常工作
- [ ] API 调用成功
- [ ] 性能指标正常
- [ ] 错误日志无异常
- [ ] 监控告警正常

### 生产环境维护

- [ ] 定期备份数据
- [ ] 监控系统资源
- [ ] 更新安全补丁
- [ ] 性能优化调整
- [ ] 日志清理和归档

---

**此部署指南涵盖了从开发到生产的完整部署流程，确保应用能够稳定、高效地运行在各种环境中。**
