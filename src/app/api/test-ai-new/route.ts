import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMoonshot } from '@langchain/community/chat_models/moonshot';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model: selectedModel = 'kimi', question = '1+1等于多少？' } = body;
    
    console.log('API路由: 开始AI测试...');
    console.log('API路由: 选择的模型:', selectedModel);
    console.log('API路由: 测试问题:', question);
    
    let model;
    let modelInfo;
    
    if (selectedModel === 'kimi') {
      // 使用 Kimi 模型（不需要代理）
      const kimiApiKey = process.env.KIMI_API_KEY;
      
      if (!kimiApiKey) {
        console.error('API路由: KIMI API密钥未找到');
        return NextResponse.json({ error: 'KIMI API密钥未配置' }, { status: 500 });
      }
      
      console.log('API路由: KIMI API密钥长度:', kimiApiKey.length);
      console.log('API路由: 创建Kimi模型...');
      
      model = new ChatMoonshot({
        model: 'kimi-k2-0711-preview',
        temperature: 0.3,
        apiKey: kimiApiKey,
      });
      
      modelInfo = {
        name: 'kimi-k2-0711-preview',
        provider: 'Moonshot AI',
        needsProxy: false
      };
      
    } else if (selectedModel === 'gemini') {
      // 使用 Gemini 模型（需要代理）
      const googleApiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      
      if (!googleApiKey) {
        console.error('API路由: Google API密钥未找到');
        return NextResponse.json({ error: 'Google API密钥未配置' }, { status: 500 });
      }
      
      // 配置代理（仅在服务器端）
      const proxyUrl = 'http://127.0.0.1:10808';
      const proxyAgent = new HttpsProxyAgent(proxyUrl);
      
      console.log('API路由: 使用代理:', proxyUrl);
      console.log('API路由: Google API密钥长度:', googleApiKey.length);
      console.log('API路由: 创建Gemini模型...');
      
      model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        apiKey: googleApiKey,
        // @ts-expect-error - Node.js specific agent option for proxy
        agent: proxyAgent,
      });
      
      modelInfo = {
        name: 'Gemini 2.5 Flash',
        provider: 'Google',
        needsProxy: true
      };
      
    } else {
      return NextResponse.json({ error: '不支持的模型类型' }, { status: 400 });
    }
    
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
    
    const startTime = Date.now();
    const response = await chain.invoke({ question });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('API路由: AI响应:', response);
    console.log('API路由: 响应时间:', responseTime, 'ms');
    
    return NextResponse.json({ 
      success: true, 
      content: response,
      message: 'AI测试成功',
      metadata: {
        model: modelInfo,
        responseTime,
        question,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: unknown) {
    const err = error as any;
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
