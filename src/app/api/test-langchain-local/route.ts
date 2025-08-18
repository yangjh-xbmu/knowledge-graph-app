import { NextRequest, NextResponse } from 'next/server';

// 模拟LangChain组件
class MockPromptTemplate {
  private template: string;
  
  constructor(template: string) {
    this.template = template;
  }
  
  format(variables: Record<string, string>): string {
    let formatted = this.template;
    Object.entries(variables).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return formatted;
  }
}

class MockLLM {
  private model: string;
  
  constructor(model: string) {
    this.model = model;
  }
  
  async invoke(prompt: string): Promise<{ content: string }> {
    // 模拟AI响应
    console.log(`[MockLLM] 使用模型: ${this.model}`);
    console.log(`[MockLLM] 输入提示: ${prompt}`);
    
    // 根据输入生成模拟响应
    const responses = {
      '编程': '编程是一门艺术，需要逻辑思维和创造力的结合。',
      '数学': '数学是科学的语言，帮助我们理解世界的规律。',
      '物理': '物理学探索自然界的基本规律和现象。',
      '化学': '化学研究物质的组成、结构、性质和变化规律。'
    };
    
    // 简单的关键词匹配
    let response = '这是一个很有趣的话题！让我来为你详细解释一下相关概念。';
    
    for (const [keyword, mockResponse] of Object.entries(responses)) {
      if (prompt.includes(keyword)) {
        response = mockResponse;
        break;
      }
    }
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { content: response };
  }
}

class MockRunnableSequence {
  private steps: Array<MockPromptTemplate | MockLLM>;
  
  constructor(steps: Array<MockPromptTemplate | MockLLM>) {
    this.steps = steps;
  }
  
  async invoke(input: Record<string, string>): Promise<{ content: string }> {
    console.log('[MockRunnableSequence] 开始执行链式调用');
    console.log('[MockRunnableSequence] 输入参数:', input);
    
    let result: Record<string, string> | string | { content: string } = input;
    
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      console.log(`[MockRunnableSequence] 执行步骤 ${i + 1}/${this.steps.length}`);
      
      if (step instanceof MockPromptTemplate) {
        const inputForTemplate = typeof result === 'object' && result !== null && !('content' in result) 
          ? result as Record<string, string>
          : { topic: typeof result === 'string' ? result : JSON.stringify(result) };
        result = step.format(inputForTemplate);
        console.log(`[MockRunnableSequence] 步骤 ${i + 1} 结果 (PromptTemplate):`, result);
      } else if (step instanceof MockLLM) {
        const inputForLLM = typeof result === 'string' 
          ? result 
          : 'content' in result 
            ? result.content 
            : JSON.stringify(result);
        result = await step.invoke(inputForLLM);
        console.log(`[MockRunnableSequence] 步骤 ${i + 1} 结果 (LLM):`, result);
      }
    }
    
    console.log('[MockRunnableSequence] 链式调用完成');
    
    // 确保返回值符合 { content: string } 类型
    if (typeof result === 'object' && result !== null && 'content' in result) {
      return result as { content: string };
    } else {
      return { content: typeof result === 'string' ? result : JSON.stringify(result) };
    }
  }
}

export async function POST(request: NextRequest) {
  console.log('\n=== LangChain 本地测试开始 ===');
  
  try {
    // 获取请求参数
    const body = await request.json();
    const { topic = '编程' } = body;
    
    console.log('请求参数:', { topic });
    
    // 检查环境变量（仅用于日志）
    const apiKey = process.env.GOOGLE_API_KEY;
    const publicApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    console.log('环境变量检查:');
    console.log('- GOOGLE_API_KEY 存在:', !!apiKey);
    console.log('- GOOGLE_API_KEY 长度:', apiKey?.length || 0);
    console.log('- NEXT_PUBLIC_GOOGLE_API_KEY 存在:', !!publicApiKey);
    console.log('- NEXT_PUBLIC_GOOGLE_API_KEY 长度:', publicApiKey?.length || 0);
    
    // 创建模拟的LangChain组件
    console.log('\n--- 创建LangChain组件 ---');
    
    const promptTemplate = new MockPromptTemplate(
      '请详细解释关于 {topic} 的核心概念，包括其重要性和应用场景。'
    );
    console.log('✓ PromptTemplate 创建成功');
    
    const llm = new MockLLM('gemini-1.5-flash');
    console.log('✓ MockLLM 创建成功');
    
    // 创建链式调用
    const chain = new MockRunnableSequence([promptTemplate, llm]);
    console.log('✓ RunnableSequence 创建成功');
    
    // 执行链式调用
    console.log('\n--- 执行LangChain链 ---');
    const startTime = Date.now();
    
    const result = await chain.invoke({ topic });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('\n--- 执行结果 ---');
    console.log('执行时间:', duration, 'ms');
    console.log('AI响应:', result.content);
    
    // 返回结果
    const response = {
      success: true,
      message: 'LangChain 本地测试成功',
      data: {
        topic,
        response: result.content,
        metadata: {
          model: 'gemini-1.5-flash (模拟)',
          executionTime: duration,
          timestamp: new Date().toISOString(),
          chainSteps: ['PromptTemplate', 'MockLLM'],
          apiKeyExists: !!apiKey,
          apiKeyLength: apiKey?.length || 0
        }
      }
    };
    
    console.log('\n=== LangChain 本地测试完成 ===\n');
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('\n=== LangChain 本地测试失败 ===');
    console.error('错误详情:', error);
    
    const errorResponse = {
      success: false,
      message: 'LangChain 本地测试失败',
      error: error instanceof Error ? error.message : '未知错误',
      details: {
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      }
    };
    
    console.log('错误响应:', errorResponse);
    console.log('=== LangChain 本地测试结束 ===\n');
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}