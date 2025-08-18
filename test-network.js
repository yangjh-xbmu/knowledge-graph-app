// 网络连接测试脚本
const https = require('https');
const { URL } = require('url');

console.log('=== 网络连接诊断开始 ===');
console.log('Node.js版本:', process.version);
console.log('平台:', process.platform);
console.log('时间:', new Date().toISOString());

// 测试1: 基本的HTTPS连接
async function testBasicHTTPS() {
  console.log('\n--- 测试1: 基本HTTPS连接 ---');
  
  return new Promise((resolve) => {
    const req = https.request('https://www.google.com', {
      method: 'HEAD',
      timeout: 10000
    }, (res) => {
      console.log('✅ Google.com连接成功');
      console.log('状态码:', res.statusCode);
      console.log('响应头:', Object.keys(res.headers).slice(0, 5));
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Google.com连接失败:', err.message);
      console.log('错误代码:', err.code);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ Google.com连接超时');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// 测试2: Google AI API域名解析
async function testGoogleAIDNS() {
  console.log('\n--- 测试2: Google AI API域名解析 ---');
  
  const dns = require('dns');
  
  return new Promise((resolve) => {
    dns.lookup('generativelanguage.googleapis.com', (err, address, family) => {
      if (err) {
        console.log('❌ DNS解析失败:', err.message);
        resolve(false);
      } else {
        console.log('✅ DNS解析成功');
        console.log('IP地址:', address);
        console.log('IP版本:', family === 4 ? 'IPv4' : 'IPv6');
        resolve(true);
      }
    });
  });
}

// 测试3: Google AI API连接
async function testGoogleAIConnection() {
  console.log('\n--- 测试3: Google AI API连接 ---');
  
  return new Promise((resolve) => {
    const req = https.request('https://generativelanguage.googleapis.com', {
      method: 'HEAD',
      timeout: 15000,
      headers: {
        'User-Agent': 'Node.js-Test/1.0'
      }
    }, (res) => {
      console.log('✅ Google AI API连接成功');
      console.log('状态码:', res.statusCode);
      console.log('服务器:', res.headers.server || 'Unknown');
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Google AI API连接失败:', err.message);
      console.log('错误代码:', err.code);
      console.log('错误详情:', err);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ Google AI API连接超时');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// 测试4: 使用fetch API（如果可用）
async function testFetchAPI() {
  console.log('\n--- 测试4: Fetch API测试 ---');
  
  try {
    // 检查fetch是否可用
    if (typeof fetch === 'undefined') {
      console.log('❌ Fetch API不可用（Node.js < 18）');
      return false;
    }
    
    console.log('✅ Fetch API可用');
    
    // 测试简单的fetch请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('✅ Fetch请求成功');
    console.log('状态:', response.status, response.statusText);
    console.log('响应头数量:', response.headers.size || 'Unknown');
    
    return true;
    
  } catch (err) {
    console.log('❌ Fetch请求失败:', err.message);
    console.log('错误名称:', err.name);
    return false;
  }
}

// 测试5: 环境变量检查
function testEnvironmentVariables() {
  console.log('\n--- 测试5: 环境变量检查 ---');
  
  const apiKey = process.env.GOOGLE_API_KEY;
  const publicApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  
  console.log('GOOGLE_API_KEY存在:', !!apiKey);
  console.log('GOOGLE_API_KEY长度:', apiKey?.length || 0);
  console.log('NEXT_PUBLIC_GOOGLE_API_KEY存在:', !!publicApiKey);
  console.log('NEXT_PUBLIC_GOOGLE_API_KEY长度:', publicApiKey?.length || 0);
  
  // 检查代理相关环境变量
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'NO_PROXY', 'no_proxy'];
  console.log('\n代理环境变量:');
  proxyVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`${varName}:`, value);
    }
  });
  
  return !!apiKey;
}

// 主测试函数
async function runDiagnostics() {
  try {
    const results = {
      basicHTTPS: await testBasicHTTPS(),
      googleAIDNS: await testGoogleAIDNS(),
      googleAIConnection: await testGoogleAIConnection(),
      fetchAPI: await testFetchAPI(),
      environmentVariables: testEnvironmentVariables()
    };
    
    console.log('\n=== 诊断结果汇总 ===');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}:`, passed ? '通过' : '失败');
    });
    
    // 分析问题
    console.log('\n=== 问题分析 ===');
    
    if (!results.basicHTTPS) {
      console.log('🔍 基本网络连接有问题，可能是网络配置或防火墙问题');
    } else if (!results.googleAIDNS) {
      console.log('🔍 DNS解析失败，可能是DNS服务器问题');
    } else if (!results.googleAIConnection) {
      console.log('🔍 Google AI API无法连接，可能是：');
      console.log('   - 防火墙阻止了对googleapis.com的访问');
      console.log('   - 网络代理配置问题');
      console.log('   - ISP限制了对Google服务的访问');
    } else if (!results.fetchAPI) {
      console.log('🔍 Fetch API有问题，可能是Node.js版本或配置问题');
    } else if (!results.environmentVariables) {
      console.log('🔍 API密钥未配置');
    } else {
      console.log('🔍 所有基础测试都通过，问题可能在于：');
      console.log('   - LangChain库的网络配置');
      console.log('   - API请求的具体参数或格式');
      console.log('   - 请求超时设置');
    }
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
  }
  
  console.log('\n=== 网络连接诊断结束 ===');
}

// 运行诊断
runDiagnostics();