import { HttpsProxyAgent } from 'https-proxy-agent';
import https from 'https';

const PROXY_URL = 'http://127.0.0.1:10808';
const TEST_URL = 'https://www.google.com';
const TIMEOUT = 10000;

console.log('=== 代理连接测试开始 ===');

// 测试直接连接
function testDirectConnection() {
  return new Promise((resolve) => {
    console.log('\n1. 测试直接连接到', TEST_URL);
    
    const req = https.get(TEST_URL, { timeout: TIMEOUT }, (res) => {
      console.log('✅ 直接连接成功');
      console.log('状态码:', res.statusCode);
      console.log('响应头:', Object.keys(res.headers).slice(0, 5));
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('响应内容长度:', data.length);
        resolve({ success: true, data: data.substring(0, 200) });
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ 直接连接失败:', err.message);
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      console.log('❌ 直接连接超时');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// 测试代理连接
function testProxyConnection() {
  return new Promise((resolve) => {
    console.log('\n2. 测试通过代理连接到', TEST_URL);
    console.log('代理地址:', PROXY_URL);
    
    try {
      const agent = new HttpsProxyAgent(PROXY_URL);
      
      const req = https.get(TEST_URL, { 
        agent,
        timeout: TIMEOUT 
      }, (res) => {
        console.log('✅ 代理连接成功');
        console.log('状态码:', res.statusCode);
        console.log('响应头:', Object.keys(res.headers).slice(0, 5));
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('响应内容长度:', data.length);
          console.log('响应内容预览:', data.substring(0, 200));
          resolve({ success: true, data: data.substring(0, 200) });
        });
      });
      
      req.on('error', (err) => {
        console.log('❌ 代理连接失败:', err.message);
        if ('code' in err && err.code) {
          console.log('错误代码:', err.code);
        }
        resolve({ success: false, error: err.message });
      });
      
      req.on('timeout', () => {
        console.log('❌ 代理连接超时');
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });
      
    } catch (err) {
      console.log('❌ 代理配置错误:', err instanceof Error ? err.message : String(err));
      resolve({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  });
}

// 运行测试
async function runTests() {
  const directResult = await testDirectConnection();
  const proxyResult = await testProxyConnection();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log('直接连接:', directResult.success ? '成功' : '失败');
  console.log('代理连接:', proxyResult.success ? '成功' : '失败');
  
  if (proxyResult.success) {
    console.log('\n✅ 代理配置正常，可以使用!');
  } else {
    console.log('\n❌ 代理配置有问题，请检查代理服务器是否运行在', PROXY_URL);
  }
  
  console.log('\n=== 代理连接测试结束 ===');
}

runTests().catch(console.error);