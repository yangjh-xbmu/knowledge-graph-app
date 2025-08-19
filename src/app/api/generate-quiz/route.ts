import { NextRequest, NextResponse } from 'next/server';
import { ChatMoonshot } from '@langchain/community/chat_models/moonshot';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
// import yaml from 'js-yaml';
import { parseQuizYAML } from '../../../services/aiQuizService';

// Cloudflare Edge Runtime 配置
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { title, description, content } = await request.json();

    if (!title || !description || !content) {
      return NextResponse.json(
        { error: '缺少必要参数：title, description, content' },
        { status: 400 }
      );
    }

    console.log('AI Quiz API: 使用Kimi模型');
    
    // 使用 Kimi 模型
    const kimiApiKey = process.env.KIMI_API_KEY;
    
    if (!kimiApiKey) {
      return NextResponse.json(
        { error: '未设置 KIMI API Key，请在环境变量中设置 KIMI_API_KEY' },
        { status: 500 }
      );
    }
    
    console.log('AI Quiz API: 使用Kimi模型，API密钥长度:', kimiApiKey.length);
    
    const model = new ChatMoonshot({
      model: 'kimi-k2-0711-preview',
      temperature: 0.3,
      apiKey: kimiApiKey,
    });
    
    const modelInfo = {
      name: 'kimi-k2-0711-preview',
      provider: 'Moonshot AI',
      needsProxy: false
    };

    // 创建提示模板
    const promptTemplate = PromptTemplate.fromTemplate(`
你是一个专业的教育测试题生成专家。请根据以下知识点内容生成高质量的测试题。

知识点标题: {title}
知识点描述: {description}
知识点内容: {content}

请生成3-5道测试题，涵盖不同难度级别。输出格式必须是严格的YAML格式，结构如下：

title: "测试题标题"
description: "测试题描述"
questions:
  - question: "题目内容"
    options:
      - "选项A"
      - "选项B"
      - "选项C"
      - "选项D"
    correctAnswer: 0  # 正确答案的索引（0-3）
    explanation: "答案解释"
    difficulty: "easy"  # easy, medium, hard
  - question: "第二题内容"
    options:
      - "选项A"
      - "选项B"
      - "选项C"
      - "选项D"
    correctAnswer: 1
    explanation: "答案解释"
    difficulty: "medium"

要求：
1. 题目要准确反映知识点内容
2. 选项要有一定的迷惑性但不能过于刁钻
3. 解释要清晰明了，帮助学习者理解
4. 难度要循序渐进
5. 必须严格按照YAML格式输出，不要添加任何其他内容
`);

    // 创建处理链
    const chain = RunnableSequence.from([
      promptTemplate,
      model,
      new StringOutputParser(),
    ]);

    console.log('开始生成AI测试题...');
    
    const startTime = Date.now();
    
    // 生成测试题
    const result = await chain.invoke({
      title,
      description,
      content
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('AI生成结果:', result);
    console.log('生成耗时:', responseTime, 'ms');

    // 解析YAML结果
    const quizData = parseQuizYAML(result);
    
    console.log('解析后的测试题数据:', quizData);

    // 添加元数据
    const responseData = {
      ...quizData,
      metadata: {
        model: modelInfo,
        responseTime,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('生成AI测试题失败:', error);
    return NextResponse.json(
      { error: '生成测试题失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
