import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import yaml from 'js-yaml';
import { HttpsProxyAgent } from 'https-proxy-agent';

// 测试题数据结构
export interface AIQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIQuizData {
  title: string;
  description: string;
  questions: AIQuizQuestion[];
}

// YAML解析函数
interface ParsedQuizData {
  title?: string;
  description?: string;
  questions?: Array<{
    question?: string;
    options?: string[];
    correctAnswer?: number;
    explanation?: string;
    difficulty?: string;
  }>;
}

export function parseQuizYAML(yamlContent: string): AIQuizData {
  try {
    const parsed = yaml.load(yamlContent) as ParsedQuizData;
    
    // 验证和转换数据结构
    const quizData: AIQuizData = {
      title: parsed.title || '自动生成测试题',
      description: parsed.description || '基于知识点内容生成的测试题',
      questions: []
    };

    if (parsed.questions && Array.isArray(parsed.questions)) {
      quizData.questions = parsed.questions.map((q, index: number) => {
        const difficulty = q.difficulty && ['easy', 'medium', 'hard'].includes(q.difficulty) 
          ? q.difficulty as 'easy' | 'medium' | 'hard'
          : 'medium';
        
        return {
          id: `ai-q-${index + 1}`,
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          explanation: q.explanation || '',
          difficulty
        };
      });
    }

    return quizData;
  } catch (error) {
    console.error('YAML解析错误:', error);
    throw new Error('无法解析AI生成的测试题内容');
  }
}

// AI测试题生成服务
export class AIQuizService {
  private model: ChatGoogleGenerativeAI;
  private promptTemplate: PromptTemplate;
  private chain: RunnableSequence<Record<string, string>, string>;

  constructor() {
    // 配置代理
    const proxyUrl = 'http://127.0.0.1:10808';
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    
    console.log('AI Quiz Service使用代理:', proxyUrl);
    
    // 初始化Gemini模型
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      // @ts-expect-error - Node.js specific agent option for proxy
      agent: proxyAgent,
    });

    // 创建提示模板
    this.promptTemplate = PromptTemplate.fromTemplate(`
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
3. 解释要清晰明了
4. 难度要合理分布
5. 严格按照YAML格式输出，不要添加任何其他内容
`);

    // 创建处理链
    this.chain = RunnableSequence.from([
      this.promptTemplate,
      this.model,
      new StringOutputParser()
    ]);
  }

  /**
   * 根据知识点内容生成测试题
   */
  async generateQuiz(knowledgeNode: {
    title: string;
    description: string;
    content: string;
  }): Promise<AIQuizData> {
    try {
      console.log('开始AI生成测试题:', knowledgeNode);
      console.log('API Key状态:', this.model ? '模型已初始化' : '模型未初始化');
      
      // 调用AI生成YAML内容
      console.log('调用AI链...');
      const yamlContent = await this.chain.invoke({
        title: knowledgeNode.title,
        description: knowledgeNode.description,
        content: knowledgeNode.content
      });
      
      console.log('AI生成的YAML内容:', yamlContent);

      // 解析YAML内容
      console.log('开始解析YAML...');
      const quizData = parseQuizYAML(yamlContent);
      console.log('解析后的测试题数据:', quizData);
      
      return quizData;
    } catch (error) {
      console.error('AI测试题生成失败:', error);
      console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
      throw new Error('生成测试题时发生错误，请稍后重试');
    }
  }
}

// 导出单例实例
export const aiQuizService = new AIQuizService();
