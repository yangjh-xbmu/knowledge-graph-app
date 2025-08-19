import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Cloudflare Edge Runtime 配置
export const runtime = 'edge';

// Edge Runtime 不支持代理配置
// 在生产环境中，Cloudflare 会处理网络请求

export async function POST(request: NextRequest) {
  try {
    console.log('LangChain测试: 开始...');
    
    // 检查环境变量
    const googleApiKey = process.env.GOOGLE_API_KEY;
    
    if (!googleApiKey) {
      console.error('LangChain测试: GOOGLE_API_KEY未设置');
      return NextResponse.json(
        { success: false, error: 'GOOGLE_API_KEY未设置' },
        { status: 500 }
      );
    }
    
    console.log('LangChain测试: API密钥存在，长度:', googleApiKey.length);
    
    // 获取请求参数
    const body = await request.json();
    const { topic = 'JavaScript基础' } = body;
    
    console.log('LangChain测试: 测试主题:', topic);
    
    // Edge Runtime 环境，不使用代理
    console.log('LangChain: Edge Runtime 环境，直接连接');
    
    // 1. 创建模型
    console.log('LangChain测试: 创建ChatGoogleGenerativeAI模型...');
    const model = new ChatGoogleGenerativeAI({
      apiKey: googleApiKey,
      model: 'gemini-1.5-flash',
      temperature: 0.7,

    });
    
    // 2. 创建提示模板
    console.log('LangChain测试: 创建PromptTemplate...');
    const promptTemplate = PromptTemplate.fromTemplate(
      `你是一个专业的教育专家。请为以下主题生成一个简短的学习要点总结：

主题: {topic}

请提供：
1. 核心概念（2-3个要点）
2. 学习建议（1-2条）
3. 实践方向（1-2个建议）

请用中文回答，保持简洁明了。`
    );
    
    // 3. 创建输出解析器
    console.log('LangChain测试: 创建StringOutputParser...');
    const outputParser = new StringOutputParser();
    
    // 4. 创建LangChain链
    console.log('LangChain测试: 创建RunnableSequence链...');
    const chain = RunnableSequence.from([
      promptTemplate,
      model,
      outputParser,
    ]);
    
    // 5. 执行链
    console.log('LangChain测试: 开始执行链...');
    const startTime = Date.now();
    
    const result = await chain.invoke({
      topic: topic
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('LangChain测试: 链执行完成，耗时:', duration, 'ms');
    console.log('LangChain测试: 结果长度:', result.length, '字符');
    console.log('LangChain测试: 结果预览:', result.substring(0, 100) + '...');
    
    return NextResponse.json({
      success: true,
      result: result,
      metadata: {
        topic: topic,
        duration: duration,
        resultLength: result.length,
        modelName: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('LangChain测试失败:', error);
    
    const err = error as Error & { status?: number; statusText?: string; };
    console.error('LangChain测试错误详情:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      status: err.status,
      statusText: err.statusText
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'LangChain测试失败',
        details: err.message || '未知错误',
        errorType: err.name || 'Error'
      },
      { status: 500 }
    );
  }
}