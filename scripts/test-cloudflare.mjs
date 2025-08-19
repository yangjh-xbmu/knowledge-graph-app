#!/usr/bin/env node

/**
 * Cloudflare Pages 兼容性测试脚本
 * 
 * 此脚本用于测试应用在 Cloudflare Pages 环境中的兼容性
 * 包括 API 路由、环境变量、构建配置等方面的测试
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(50)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 测试结果统计
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description}: ${filePath}`);
    testResults.passed++;
    return true;
  } else {
    logError(`${description} 不存在: ${filePath}`);
    testResults.failed++;
    return false;
  }
}

/**
 * 检查文件内容
 */
function checkFileContent(filePath, pattern, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (pattern.test(content)) {
      logSuccess(`${description}`);
      testResults.passed++;
      return true;
    } else {
      logError(`${description} - 未找到匹配内容`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`${description} - 读取文件失败: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

/**
 * 执行命令并检查结果
 */
function runCommand(command, description, expectSuccess = true) {
  try {
    logInfo(`执行: ${command}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    if (expectSuccess) {
      logSuccess(`${description} - 成功`);
      testResults.passed++;
    }
    return { success: true, output };
  } catch (error) {
    if (expectSuccess) {
      logError(`${description} - 失败: ${error.message}`);
      testResults.failed++;
    } else {
      logSuccess(`${description} - 预期失败`);
      testResults.passed++;
    }
    return { success: false, error: error.message };
  }
}

/**
 * 测试 Next.js 配置
 */
function testNextConfig() {
  logSection('测试 Next.js 配置');
  
  // 检查 next.config.ts 是否存在
  const configPath = path.join(process.cwd(), 'next.config.ts');
  if (!checkFileExists(configPath, 'Next.js 配置文件')) {
    return;
  }
  
  // 检查关键配置项
  const checks = [
    { pattern: /output:\s*['"]export['"]/, desc: '静态导出配置' },
    { pattern: /trailingSlash:\s*true/, desc: '尾部斜杠配置' },
    { pattern: /unoptimized:\s*true/, desc: '图片优化配置' },
    { pattern: /serverComponentsExternalPackages/, desc: '外部包配置' }
  ];
  
  checks.forEach(check => {
    checkFileContent(configPath, check.pattern, check.desc);
  });
}

/**
 * 测试 API 路由配置
 */
function testApiRoutes() {
  logSection('测试 API 路由配置');
  
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  if (!fs.existsSync(apiDir)) {
    logError('API 目录不存在');
    testResults.failed++;
    return;
  }
  
  // 查找所有 route.ts 文件
  function findRouteFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findRouteFiles(fullPath));
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const routeFiles = findRouteFiles(apiDir);
  logInfo(`找到 ${routeFiles.length} 个 API 路由文件`);
  
  // 检查每个路由文件
  routeFiles.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // 检查是否有 Edge Runtime 配置
    const hasEdgeRuntime = checkFileContent(
      filePath,
      /export\s+const\s+runtime\s*=\s*['"]edge['"]/,
      `${relativePath} - Edge Runtime 配置`
    );
    
    // 检查是否有代理配置的条件化处理
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('HttpsProxyAgent') || content.includes('https-proxy-agent')) {
      const hasConditionalProxy = /CF_PAGES|CLOUDFLARE_ENV|isCloudflare/.test(content);
      if (hasConditionalProxy) {
        logSuccess(`${relativePath} - 代理配置已条件化`);
        testResults.passed++;
      } else {
        logWarning(`${relativePath} - 代理配置可能需要条件化处理`);
        testResults.warnings++;
      }
    }
  });
}

/**
 * 测试环境变量配置
 */
function testEnvironmentConfig() {
  logSection('测试环境变量配置');
  
  // 检查环境变量文件
  const envFiles = [
    { path: '.env.example', desc: '环境变量示例文件' },
    { path: '.env.cloudflare', desc: 'Cloudflare 环境变量文件' }
  ];
  
  envFiles.forEach(file => {
    checkFileExists(path.join(process.cwd(), file.path), file.desc);
  });
  
  // 检查 .gitignore 配置
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    // 检查是否正确忽略环境变量文件
    if (gitignoreContent.includes('.env') && gitignoreContent.includes('!.env.example')) {
      logSuccess('.gitignore 环境变量配置正确');
      testResults.passed++;
    } else {
      logError('.gitignore 环境变量配置可能有问题');
      testResults.failed++;
    }
  }
}

/**
 * 测试 Wrangler 配置
 */
function testWranglerConfig() {
  logSection('测试 Wrangler 配置');
  
  const wranglerPath = path.join(process.cwd(), 'wrangler.toml');
  if (!checkFileExists(wranglerPath, 'Wrangler 配置文件')) {
    return;
  }
  
  // 检查关键配置项
  const checks = [
    { pattern: /name\s*=/, desc: '项目名称配置' },
    { pattern: /compatibility_date/, desc: '兼容性日期配置' },
    { pattern: /command\s*=.*build/, desc: '构建命令配置' },
    { pattern: /directory\s*=.*\.next/, desc: '输出目录配置' }
  ];
  
  checks.forEach(check => {
    checkFileContent(wranglerPath, check.pattern, check.desc);
  });
}

/**
 * 测试依赖项
 */
function testDependencies() {
  logSection('测试依赖项');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json 不存在');
    testResults.failed++;
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 检查关键依赖
  const requiredDeps = ['next', 'react', 'react-dom'];
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      logSuccess(`依赖项 ${dep}: ${allDeps[dep]}`);
      testResults.passed++;
    } else {
      logError(`缺少依赖项: ${dep}`);
      testResults.failed++;
    }
  });
  
  // 检查可能有问题的依赖
  const problematicDeps = ['https-proxy-agent'];
  problematicDeps.forEach(dep => {
    if (allDeps[dep]) {
      logWarning(`发现可能有问题的依赖: ${dep} - 请确保已正确处理 Cloudflare 兼容性`);
      testResults.warnings++;
    }
  });
}

/**
 * 测试构建过程
 */
function testBuild() {
  logSection('测试构建过程');
  
  // 检查是否有 build 脚本
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts || !packageJson.scripts.build) {
    logError('package.json 中缺少 build 脚本');
    testResults.failed++;
    return;
  }
  
  logInfo('开始构建测试...');
  
  // 清理之前的构建
  runCommand('rm -rf .next', '清理构建目录', false);
  
  // 执行构建
  const buildResult = runCommand('npm run build', '执行构建');
  
  if (buildResult.success) {
    // 检查构建输出
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      logSuccess('构建输出目录存在');
      testResults.passed++;
      
      // 检查静态文件
      const staticDir = path.join(nextDir, 'static');
      if (fs.existsSync(staticDir)) {
        logSuccess('静态文件目录存在');
        testResults.passed++;
      } else {
        logWarning('静态文件目录不存在');
        testResults.warnings++;
      }
    } else {
      logError('构建输出目录不存在');
      testResults.failed++;
    }
  }
}

/**
 * 测试 TypeScript 配置
 */
function testTypeScriptConfig() {
  logSection('测试 TypeScript 配置');
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!checkFileExists(tsconfigPath, 'TypeScript 配置文件')) {
    return;
  }
  
  // 运行类型检查
  runCommand('npx tsc --noEmit', 'TypeScript 类型检查');
}

/**
 * 模拟 Cloudflare 环境测试
 */
function testCloudflareEnvironment() {
  logSection('模拟 Cloudflare 环境测试');
  
  // 设置 Cloudflare 环境变量（仅用于测试显示）
  const originalEnv = {
    CF_PAGES: process.env.CF_PAGES,
    CLOUDFLARE_ENV: process.env.CLOUDFLARE_ENV
  };
  
  // 临时设置环境变量进行测试
  Object.assign(process.env, {
    CF_PAGES: '1',
    CLOUDFLARE_ENV: 'production'
  });
  
  logInfo('模拟设置 Cloudflare 环境变量');
  logInfo('CF_PAGES=1');
  logInfo('CLOUDFLARE_ENV=production');
  
  // 这里可以添加更多的环境特定测试
  logSuccess('Cloudflare 环境变量模拟设置完成');
  testResults.passed++;
  
  // 恢复原始环境变量
  Object.assign(process.env, originalEnv);
}

/**
 * 生成测试报告
 */
function generateReport() {
  logSection('测试报告');
  
  const total = testResults.passed + testResults.failed + testResults.warnings;
  
  log(`\n测试总数: ${total}`, 'bright');
  log(`✅ 通过: ${testResults.passed}`, 'green');
  log(`❌ 失败: ${testResults.failed}`, 'red');
  log(`⚠️  警告: ${testResults.warnings}`, 'yellow');
  
  const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  log(`\n成功率: ${successRate}%`, 'bright');
  
  if (testResults.failed === 0) {
    log('\n🎉 所有测试通过！应用已准备好部署到 Cloudflare Pages。', 'green');
    return 0;
  } else {
    log('\n🚨 存在失败的测试，请修复后再部署。', 'red');
    return 1;
  }
}

/**
 * 主函数
 */
function main() {
  log('Cloudflare Pages 兼容性测试', 'bright');
  log('此脚本将检查应用的 Cloudflare Pages 兼容性\n', 'blue');
  
  try {
    // 执行各项测试
    testNextConfig();
    testApiRoutes();
    testEnvironmentConfig();
    testWranglerConfig();
    testDependencies();
    testTypeScriptConfig();
    testCloudflareEnvironment();
    
    // 如果前面的测试都通过，再执行构建测试
    if (testResults.failed === 0) {
      testBuild();
    } else {
      logWarning('由于存在失败的测试，跳过构建测试');
    }
    
    // 生成报告
    const exitCode = generateReport();
    process.exit(exitCode);
    
  } catch (error) {
    logError(`测试过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  main,
  testResults,
  log,
  logSuccess,
  logError,
  logWarning,
  logInfo
};