import { NextResponse } from 'next/server';

// Cloudflare Edge Runtime 配置
export const runtime = 'edge';

export async function POST() {
  try {
    console.log('简单API测试: 开始...');
    
    // 检查环境变量
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const publicApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    console.log('简单API测试: GOOGLE_API_KEY存在:', !!googleApiKey);
    console.log('简单API测试: NEXT_PUBLIC_GOOGLE_API_KEY存在:', !!publicApiKey);
    console.log('简单API测试: API密钥长度:', googleApiKey?.length || 0);
    
    // 模拟AI响应
    const mockResponse = {
      success: true,
      message: '这是一个模拟的AI响应，用于测试API功能',
      timestamp: new Date().toISOString(),
      apiKeyExists: !!googleApiKey,
      apiKeyLength: googleApiKey?.length || 0
    };
    
    console.log('简单API测试: 返回模拟响应:', mockResponse);
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('简单API测试失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '简单API测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}