import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Cloudflare Edge Runtime 配置
export const runtime = 'edge';

// Edge Runtime 不支持代理配置
// 在生产环境中，Cloudflare 会处理网络请求

export async function POST() {
  try {
    console.log('API路由: 开始AI测试...');
    console.log('API路由: GOOGLE_API_KEY存在:', !!process.env.GOOGLE_API_KEY);
    console.log('API路由: NEXT_PUBLIC_GOOGLE_API_KEY存在:', !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
    
    // 检测运行环境
    // Edge Runtime 环境，不使用代理
    console.log('API路由: Edge Runtime 环境，直接连接');
    
    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('API路由: API密钥未找到');
      return NextResponse.json({ error: 'API密钥未配置' }, { status: 500 });
    }
    
    console.log('API路由: API密钥长度:', apiKey.length);
    console.log('API路由: 创建模型...');
    
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      apiKey: apiKey,
    });
    
    console.log('API路由: 模型已创建，创建LangChain链...');
    
    // 创建提示模板
    const promptTemplate = PromptTemplate.fromTemplate(
      '你是一个智能助手。请回答以下问题：{question}'
    );
    
    // 创建LangChain处理链
    const chain = RunnableSequence.from([
      promptTemplate,
      model,
      new StringOutputParser()
    ]);
    
    console.log('API路由: 开始调用LangChain链...');
    
    const response = await chain.invoke({ question: '1+1等于多少？' });
    console.log('API路由: AI响应:', response);
    
    return NextResponse.json({ 
      success: true, 
      content: response,
      message: 'AI测试成功'
    });
    
  } catch (error: unknown) {
    const err = error as Error & { status?: number; statusText?: string; };
    console.error('API路由: AI测试失败:', error);
    console.error('API路由: 错误详情:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      status: err?.status,
      statusText: err?.statusText
    });
    
    return NextResponse.json({ 
      error: err?.message || '未知错误',
      details: {
        name: err?.name,
        status: err?.status,
        statusText: err?.statusText
      }
    }, { status: 500 });
  }
}
