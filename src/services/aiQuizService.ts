import yaml from 'js-yaml';

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

// AI测试题生成服务（客户端版本）
export class AIQuizService {
  private preferredModel: 'kimi' | 'gemini' = 'kimi'; // 默认使用kimi模型

  constructor() {
    // 客户端版本不需要初始化任何 Node.js 特定的依赖
  }

  /**
   * 设置首选的AI模型
   */
  setPreferredModel(model: 'kimi' | 'gemini') {
    this.preferredModel = model;
    console.log(`AIQuizService切换到模型: ${model}`);
  }

  /**
   * 获取当前首选模型
   */
  getPreferredModel(): 'kimi' | 'gemini' {
    return this.preferredModel;
  }

  /**
   * 根据知识点内容生成测试题
   */
  async generateQuiz(knowledgeNode: {
    title: string;
    description: string;
    content: string;
  }, modelType?: 'kimi' | 'gemini'): Promise<AIQuizData> {
    try {
      const useModel = modelType || this.preferredModel;
      console.log(`开始使用 ${useModel} 模型生成AI测试题...`);
      
      // 通过 API 路由生成测试题
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: knowledgeNode.title,
          description: knowledgeNode.description,
          content: knowledgeNode.content,
          model: useModel // 添加模型选择参数
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const quizData = await response.json();
      
      console.log('解析后的测试题数据:', quizData);

      return quizData;
    } catch (error) {
      console.error(`生成AI测试题失败 (${modelType || this.preferredModel}):`, error);
      throw new Error(`生成测试题失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 导出单例实例
export const aiQuizService = new AIQuizService();
