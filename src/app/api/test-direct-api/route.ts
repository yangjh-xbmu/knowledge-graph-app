import { NextRequest, NextResponse } from 'next/server';

// Cloudflare Edge Runtime 配置
export const runtime = 'edge';

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
    
    // Edge Runtime 环境，使用 fetch API
    console.log('Edge Runtime 环境，使用 fetch API 直接连接');
    
    console.log('\n--- 开始 fetch 请求 ---');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`请求完成，耗时: ${duration}ms`);
    console.log('响应状态:', response.status, response.statusText);
    
    // 记录响应头
    console.log('\n--- 响应头 ---');
    response.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API请求失败:', response.status, response.statusText);
      console.error('错误详情:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `API请求失败: ${response.status} ${response.statusText}`,
        details: errorText,
        duration: duration
      }, { status: response.status });
    }
    
    const responseData = await response.json();
    console.log('\n--- API响应成功 ---');
    console.log('响应数据:', JSON.stringify(responseData, null, 2));
    
    // 提取生成的文本
    let generatedText = '';
    if (responseData.candidates && responseData.candidates.length > 0) {
      const candidate = responseData.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        generatedText = candidate.content.parts[0].text || '';
      }
    }
    
    console.log('生成的文本:', generatedText);
    console.log('=== 直接API连接测试完成 ===\n');
    
    return NextResponse.json({
      success: true,
      message: '直接API连接测试成功',
      prompt: prompt,
      response: generatedText,
      fullResponse: responseData,
      duration: duration,
      method: 'fetch API',
      environment: 'Edge Runtime'
    });
    
  } catch (error) {
    console.error('\n=== 直接API连接测试失败 ===');
    console.error('错误详情:', error);
    
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    return NextResponse.json({
      success: false,
      error: '直接API连接测试失败',
      details: errorMessage,
      method: 'fetch API',
      environment: 'Edge Runtime'
    }, { status: 500 });
  }
}