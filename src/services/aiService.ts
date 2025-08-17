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
    return `请根据以下知识点生成${questionCount}道选择题。

知识点标题: ${knowledge.title}
知识点描述: ${knowledge.description}
知识点内容: ${knowledge.content}
知识点级别: ${knowledge.level}
知识点类别: ${knowledge.category}

要求：
0. 所有题目包括选项和解释都必须是Markdown格式。使用中文
1. 每道题目应该测试对该知识点的理解
2. 提供4个选项，每个选项必须是唯一的，不能重复，且不要有ABCD这样的标记。
3. 选项内容要有意义，避免使用"以上都不对"、"以上都对"等模糊选项
4. 包含正确答案的详细解释
5. 题目难度应该符合知识点的级别（${knowledge.level}）
6. 确保每道题只有一个正确答案
7. 选项长度要适中，避免过长或过短
8. **严格的Markdown代码格式要求（极其重要 - 必须严格遵守）：**
   - 题目和解释中的变量名、函数名、简短代码片段（1行）使用行内代码：\`code\`
9. 严格按照以下JSON格式返回，不要包含任何其他文本：

{
  "questions": [
    {
      "id": "1",
      "question": "题目内容",
      "options": [
        "选项A的文本描述",
        "\`\`\`" + codeLanguage + "\\ncode here\\n\`\`\`",
        "选项C的文本描述", 
        "\`\`\`" + codeLanguage + "\\nanother code\\n\`\`\`"
      ],
      "correctAnswer": 0,
      "explanation": "答案解释，如果包含代码也要用：\`\`\`" + codeLanguage + "\\ncode\\n\`\`\`"
    }
  ],
  "totalQuestions": ${questionCount}
}

注意：选项中的代码必须严格按照上述格式，使用完整的代码块标记。`;
  }

  private optimizeCodeFormat(jsonString: string): string {
    try {
      // 解析JSON以便处理选项
      const data = JSON.parse(jsonString);
      
      if (data.questions && Array.isArray(data.questions)) {
        data.questions.forEach((question: any) => {
          if (question.options && Array.isArray(question.options)) {
            question.options = question.options.map((option: string) => {
              return this.fixCodeBlockFormat(option);
            });
          }
          // 同时优化explanation中的代码格式
          if (question.explanation) {
            question.explanation = this.fixCodeBlockFormat(question.explanation);
          }
        });
      }
      
      return JSON.stringify(data);
    } catch (error) {
      // 如果JSON解析失败，返回原字符串
      return jsonString;
    }
  }

  private fixCodeBlockFormat(text: string): string {
    // 检测并修复不完整的代码块格式
    // 匹配模式："语言\n代码内容" 但不是完整的代码块
    const codePattern = /^(typescript|javascript|python|java|cpp|c|go|rust|php|ruby|swift|kotlin|scala|dart|html|css|sql|json|yaml|xml|bash|shell)\n([\s\S]+)$/;
    
    const match = text.match(codePattern);
    if (match) {
      const language = match[1];
      const code = match[2];
      
      // 检查是否已经是完整的代码块格式
      if (!text.startsWith('```') || !text.endsWith('```')) {
        // 转换为完整的代码块格式
        return `\`\`\`${language}\n${code}\n\`\`\``;
      }
    }
    
    return text;
  }

  private parseQuizResponse(response: string): QuizData {
    try {
      // 清理响应文本，移除可能的markdown代码块标记
      let cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // 优化选项中的代码格式
      cleanResponse = this.optimizeCodeFormat(cleanResponse);
      
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
