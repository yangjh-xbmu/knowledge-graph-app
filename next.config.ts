import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 兼容性配置
  
  // 输出配置 - 支持静态导出和服务端渲染
  output: 'export',
  
  // 尾部斜杠配置 - Cloudflare Pages 要求
  trailingSlash: true,
  
  // 图片优化配置 - Cloudflare 兼容
  images: {
    // 禁用默认的图片优化，使用 Cloudflare 的图片优化
    unoptimized: true,
  },
  
  // 外部包配置 - Cloudflare Edge Runtime 兼容性
  experimental: {
    serverComponentsExternalPackages: ['@langchain/google-genai', 'langchain'],
  },
  
  // 环境变量配置
  env: {
    // 确保环境变量在构建时可用
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    KIMI_API_KEY: process.env.KIMI_API_KEY,
  },
  
  // Webpack 配置 - 处理 Edge Runtime 兼容性
  webpack: (config, { isServer, nextRuntime }) => {
    // 为 Edge Runtime 添加特殊处理
    if (nextRuntime === 'edge') {
      // 排除 Node.js 特定模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  }
};

export default nextConfig;
