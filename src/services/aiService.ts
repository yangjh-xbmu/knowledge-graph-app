import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMoonshot } from '@langchain/community/chat_models/moonshot';
import { HumanMessage } from '@langchain/core/messages';
import { KnowledgeNode } from '../types/knowledge';
import { HttpsProxyAgent } from 'https-proxy-agent';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  totalQuestions: number;
}

// 简化的接口 - 直接返回Markdown内容
export interface QuizMarkdown {
  content: string;
  knowledgeTitle: string;
}

type AIModelType = 'kimi' | 'gemini';

class AIService {
  private kimiModel: ChatMoonshot | null = null;
  private geminiModel: ChatGoogleGenerativeAI | null = null;
  private currentModel: AIModelType = 'kimi'; // 默认使用kimi模型

  // 设置当前使用的模型
  setModel(modelType: AIModelType) {
    this.currentModel = modelType;
    console.log(`AI Service切换到模型: ${modelType}`);
  }

  // 获取当前模型类型
  getCurrentModel(): AIModelType {
    return this.currentModel;
  }

  private initializeKimiModel() {
    if (this.kimiModel) return;
    
    const kimiApiKey = process.env.NEXT_PUBLIC_KIMI_API_KEY || process.env.KIMI_API_KEY;
    if (!kimiApiKey) {
      console.warn('KIMI_API_KEY is not set in environment variables.');
      return;
    }

    try {
      console.log('AI Service初始化Kimi模型...');
      
      this.kimiModel = new ChatMoonshot({
        model: 'moonshot-v1-8k',
        temperature: 0.3,
        apiKey: kimiApiKey,
      });
    } catch (error) {
      console.error('Failed to initialize Kimi model:', error);
    }
  }

  private initializeGeminiModel() {
    if (this.geminiModel) return;
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_API_KEY is not set in environment variables.');
      return;
    }

    try {
      // 配置代理
      const proxyUrl = 'http://127.0.0.1:10808';
      const proxyAgent = new HttpsProxyAgent(proxyUrl);
      
      console.log('AI Service初始化Gemini模型，使用代理:', proxyUrl);
      
      this.geminiModel = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        apiKey: apiKey,
        // @ts-expect-error - Node.js specific agent option for proxy
        agent: proxyAgent,
      });
    } catch (error) {
      console.error('Failed to initialize Gemini model:', error);
    }
  }

  private getActiveModel() {
    if (this.currentModel === 'kimi') {
      this.initializeKimiModel();
      return this.kimiModel;
    } else {
      this.initializeGeminiModel();
      return this.geminiModel;
    }
  }

  // 🎯 核心方法：直接生成Markdown格式的测验
  async generateQuizMarkdown(knowledge: KnowledgeNode, questionCount: number = 5, modelType?: AIModelType): Promise<QuizMarkdown> {
    // 如果指定了模型类型，则临时切换
    const originalModel = this.currentModel;
    if (modelType && modelType !== this.currentModel) {
      this.setModel(modelType);
    }
    
    const activeModel = this.getActiveModel();
    
    if (!activeModel) {
      console.log(`${this.currentModel} model not available, using fallback quiz`);
      // 恢复原始模型设置
      if (modelType && modelType !== originalModel) {
        this.setModel(originalModel);
      }
      return this.getFallbackQuizMarkdown(knowledge);
    }
    
    const prompt = this.createQuizPrompt(knowledge, questionCount);
    
    try {
      console.log(`使用 ${this.currentModel} 模型生成测验...`);
      const startTime = Date.now();
      
      const response = await activeModel.invoke([
        new HumanMessage(prompt)
      ]);

      const responseTime = Date.now() - startTime;
      console.log(`${this.currentModel} 模型响应时间: ${responseTime}ms`);

      // 恢复原始模型设置
      if (modelType && modelType !== originalModel) {
        this.setModel(originalModel);
      }

      return {
        content: response.content as string,
        knowledgeTitle: knowledge.title
      };
    } catch (error) {
      console.error(`Error generating quiz with ${this.currentModel}:`, error);
      
      // 恢复原始模型设置
      if (modelType && modelType !== originalModel) {
        this.setModel(originalModel);
      }
      
      return this.getFallbackQuizMarkdown(knowledge);
    }
  }

  // 🔄 重写提示词：不局限于TypeScript，基于知识点内容
  private createQuizPrompt(knowledge: KnowledgeNode, questionCount: number): string {
    // 根据知识点内容智能判断编程语言
    const detectLanguage = (content: string): string => {
      if (content.includes('TypeScript') || content.includes('interface') || content.includes('.ts')) return 'typescript';
      if (content.includes('JavaScript') || content.includes('.js')) return 'javascript';
      if (content.includes('Python') || content.includes('.py')) return 'python';
      if (content.includes('Java') || content.includes('class ')) return 'java';
      if (content.includes('C++') || content.includes('#include')) return 'cpp';
      if (content.includes('Go') || content.includes('func ')) return 'go';
      return 'text'; // 默认为通用文本
    };

    const language = detectLanguage(knowledge.content + ' ' + knowledge.description);
    const languageHint = language !== 'text' ? `主要涉及${language}编程语言，` : '';

    return `基于以下知识点生成 ${questionCount} 道选择题：

**知识点标题**: ${knowledge.title}
**知识点描述**: ${knowledge.description}
**知识点内容**: ${knowledge.content}
**知识点级别**: ${knowledge.level}
**知识点类别**: ${knowledge.category}

请按照以下Markdown格式输出，${languageHint}题目要贴合实际应用场景：

# ${knowledge.title} - 测验题目

## 题目 1

**问题：** [具体问题描述]

**选项：**
- A. [选项A]
- B. [选项B] 
- C. [选项C]
- D. [选项D]

**正确答案：** A

**解释：** [详细解释为什么这个答案正确]

---

## 题目 2

...

**要求：**
1. 题目要有实际意义，难度适合${knowledge.level}级别
2. 选项要有合理的迷惑性
3. 代码片段使用适当的代码块格式
4. 解释要详细且有教育意义
5. 严格按照上述Markdown格式输出
6. 不要添加任何格式说明或额外文字

请生成 ${questionCount} 道题目。`;
  }

  // 📝 简化的备用测验
  private getFallbackQuizMarkdown(knowledge: KnowledgeNode): QuizMarkdown {
    return {
      content: `# ${knowledge.title} - 测验题目

## 题目 1

**问题：** 关于 ${knowledge.title} 的基本概念，以下哪个说法是正确的？

**选项：**
- A. 这是一个复杂的概念
- B. 需要深入理解
- C. 是基础知识点
- D. 以上都对

**正确答案：** D

**解释：** ${knowledge.title} 确实需要全面理解，包括其复杂性、深度和基础重要性。每个方面都很重要。`,
      knowledgeTitle: knowledge.title
    };
  }
}

// 导出单例实例
export const aiService = new AIService();
export default aiService;
