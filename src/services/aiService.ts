import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { KnowledgeNode } from '../types/knowledge';

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

class AIService {
  private model: ChatGoogleGenerativeAI | null = null;

  private initializeModel() {
    if (this.model) return;
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_API_KEY is not set in environment variables. AI features will use fallback data.');
      return;
    }

    try {
      this.model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        apiKey: apiKey,
      });
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
    }
  }

  async generateQuiz(knowledge: KnowledgeNode, questionCount: number = 5): Promise<QuizData> {
    this.initializeModel();
    
    // 如果模型未初始化，直接返回备用测试题
    if (!this.model) {
      console.log('AI model not available, using fallback quiz');
      return this.getFallbackQuiz(knowledge);
    }
    
    const prompt = this.createQuizPrompt(knowledge, questionCount);
    
    try {
      const response = await this.model.invoke([
        new HumanMessage(prompt)
      ]);

      const quizData = this.parseQuizResponse(response.content as string);
      return quizData;
    } catch (error) {
      console.error('Error generating quiz:', error);
      // 返回备用测试题
      return this.getFallbackQuiz(knowledge);
    }
  }

  private createQuizPrompt(knowledge: KnowledgeNode, questionCount: number): string {
    return `请根据以下TypeScript知识点生成${questionCount}道选择题。

知识点标题: ${knowledge.title}
知识点描述: ${knowledge.description}
知识点内容: ${knowledge.content}
知识点级别: ${knowledge.level}
知识点类别: ${knowledge.category}

要求：
1. 每道题目应该测试对该知识点的理解
2. 提供4个选项，每个选项必须是唯一的，不能重复，且不要有ABCD这样的标记。
3. 选项内容要有意义，避免使用"以上都不对"、"以上都对"等模糊选项
4. 包含正确答案的详细解释
5. 题目难度应该符合知识点的级别（${knowledge.level}）
6. 确保每道题只有一个正确答案
7. 选项长度要适中，避免过长或过短
8. 严格按照以下JSON格式返回，不要包含任何其他文本：

{
  "questions": [
    {
      "id": "1",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": 0,
      "explanation": "答案解释"
    }
  ],
  "totalQuestions": ${questionCount}
}`;
  }

  private parseQuizResponse(response: string): QuizData {
    try {
      // 清理响应文本，移除可能的markdown代码块标记
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // 验证数据结构
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid quiz data structure');
      }

      return {
        questions: parsed.questions.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          explanation: q.explanation || ''
        })),
        totalQuestions: parsed.totalQuestions || parsed.questions.length
      };
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  private getFallbackQuiz(knowledge: KnowledgeNode): QuizData {
    // 根据知识点类别和级别提供备用测试题
    const fallbackQuestions: QuizQuestion[] = [
      {
        id: '1',
        question: `关于${knowledge.title}，以下哪个说法是正确的？`,
        options: [
          '这是一个基础概念',
          '这是一个高级特性',
          '这不属于TypeScript',
          '以上都不对'
        ],
        correctAnswer: knowledge.level <= 2 ? 0 : 1,
        explanation: `${knowledge.title}是TypeScript中的${knowledge.level <= 2 ? '基础' : '高级'}概念。`
      },
      {
        id: '2',
        question: `${knowledge.title}主要用于什么场景？`,
        options: [
          '类型定义',
          '代码组织',
          '性能优化',
          '错误处理'
        ],
        correctAnswer: knowledge.category === 'basic' ? 0 : 1,
        explanation: `根据知识点分类，${knowledge.title}主要用于${knowledge.category === 'basic' ? '类型定义' : '代码组织'}。`
      }
    ];

    return {
      questions: fallbackQuestions,
      totalQuestions: fallbackQuestions.length
    };
  }
}

// 导出单例实例
export const aiService = new AIService();
export default aiService;
