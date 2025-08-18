import { NextRequest, NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';
import https from 'https';

// 直接测试Google Gemini API的连接
export async function POST(request: NextRequest) {
  console.log('\n=== 直接API连接测试开始 ===');
  
  try {
    const body = await request.json();
    const { prompt = '你好，请简单介绍一下自己。' } = body;
    
    console.log('测试提示:', prompt);
    
    // 获取API密钥
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY 环境变量未设置');
    }
    
    console.log('API密钥长度:', apiKey.length);
    
    // 构建请求URL和数据
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestData = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    console.log('请求URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    console.log('请求数据:', JSON.stringify(requestData, null, 2));
    
    // 配置代理
    const proxyUrl = 'http://127.0.0.1:10808';
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    
    console.log('使用代理:', proxyUrl);
    
    // 直接使用代理配置（已知有效）
    const config = {
      name: '使用代理',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: JSON.stringify(requestData),
        // @ts-expect-error - Node.js specific agent option
         agent: proxyAgent
      }
    };
    
    console.log(`\n--- 使用配置: ${config.name} ---`);
    
    try {
      const startTime = Date.now();
        
        // 设置超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('请求超时，中止请求');
          controller.abort();
        }, 10000); // 10秒超时
        
        // 使用Node.js https模块而不是fetch来支持代理
        const response = await new Promise<{
          ok: boolean;
          status: number;
          statusText: string;
          headers: { forEach: (callback: (value: string, key: string) => void) => void };
          json: () => Promise<unknown>;
          text: () => Promise<string>;
        }>((resolve, reject) => {
          const urlObj = new URL(url);
          const options: https.RequestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: config.options.method as string,
            headers: config.options.headers as Record<string, string>,
            agent: config.name === '使用代理' ? proxyAgent : undefined,
            timeout: 10000
          };
          
          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              // 创建类似fetch Response的对象
              const mockResponse = {
                ok: res.statusCode! >= 200 && res.statusCode! < 300,
                status: res.statusCode!,
                statusText: res.statusMessage || '',
                headers: {
                  forEach: (callback: (value: string, key: string) => void) => {
                    Object.entries(res.headers || {}).forEach(([key, value]: [string, string | string[] | undefined]) => {
                      callback(Array.isArray(value) ? value.join(', ') : value || '', key);
                    });
                  }
                },
                json: async () => JSON.parse(data),
                text: async () => data
              };
              
              resolve(mockResponse);
            });
          });
          
          req.on('error', reject);
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
          });
          
          if (config.options.body) {
            req.write(config.options.body as string);
          }
          req.end();
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        
        console.log('响应状态:', response.status, response.statusText);
        console.log('响应时间:', endTime - startTime, 'ms');
        console.log('响应头:');
        response.headers.forEach((value, key) => {
          console.log(`  ${key}: ${value}`);
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('错误响应内容:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json() as Record<string, unknown>;
        console.log('响应数据:', JSON.stringify(responseData, null, 2));
        
        // 成功！
        console.log('✅ API调用成功!');
        
        const result = {
          success: true,
          message: `使用配置"${config.name}"成功调用API`,
          data: {
            prompt,
            response: (responseData as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates?.[0]?.content?.parts?.[0]?.text || '无响应内容',
            metadata: {
              config: config.name,
              responseTime: endTime - startTime,
              timestamp: new Date().toISOString(),
              apiKeyLength: apiKey.length
            }
          }
        };
        
        console.log('=== 直接API连接测试成功 ===\n');
        return NextResponse.json(result);
        
    } catch (error) {
      console.log(`❌ 配置"${config.name}"失败:`, error);
      
      if (error instanceof Error) {
        console.log('错误名称:', error.name);
        console.log('错误消息:', error.message);
        if ('cause' in error) {
          console.log('错误原因:', error.cause);
        }
      }
      
      // 抛出错误到外层处理
      throw error;
    }
    
  } catch (error) {
    console.error('=== 直接API连接测试失败 ===');
    console.error('最终错误:', error);
    
    const errorResponse = {
      success: false,
      message: '直接API连接测试失败',
      error: error instanceof Error ? error.message : '未知错误',
      details: {
        timestamp: new Date().toISOString(),
        errorName: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    console.log('错误响应:', JSON.stringify(errorResponse, null, 2));
    console.log('=== 直接API连接测试结束 ===\n');
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}