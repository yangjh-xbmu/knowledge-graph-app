import { MasteryState } from '../types/knowledge';

class MasteryService {
  private readonly STORAGE_KEY = 'knowledge-mastery-state';

  // 获取所有掌握状态
  getAllMasteryStates(): MasteryState[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const states = JSON.parse(stored);
      // 转换日期字符串回Date对象
      return states.map((state: { nodeId: string; masteredAt: string; quizScore?: number }) => ({
        ...state,
        masteredAt: new Date(state.masteredAt)
      }));
    } catch (error) {
      console.error('Error loading mastery states:', error);
      return [];
    }
  }

  // 获取特定知识点的掌握状态
  getMasteryState(nodeId: string): MasteryState | null {
    const states = this.getAllMasteryStates();
    return states.find(state => state.nodeId === nodeId) || null;
  }

  // 标记知识点为已掌握
  markAsMastered(nodeId: string, quizScore?: number): void {
    const states = this.getAllMasteryStates();
    const existingIndex = states.findIndex(state => state.nodeId === nodeId);
    
    const masteryState: MasteryState = {
      nodeId,
      isMastered: true,
      masteredAt: new Date(),
      quizScore,
      quizAttempts: existingIndex >= 0 ? (states[existingIndex].quizAttempts || 0) + 1 : 1
    };

    if (existingIndex >= 0) {
      states[existingIndex] = masteryState;
    } else {
      states.push(masteryState);
    }

    this.saveMasteryStates(states);
  }

  // 取消掌握状态
  unmarkAsMastered(nodeId: string): void {
    const states = this.getAllMasteryStates();
    const filteredStates = states.filter(state => state.nodeId !== nodeId);
    this.saveMasteryStates(filteredStates);
  }

  // 检查知识点是否已掌握
  isMastered(nodeId: string): boolean {
    const state = this.getMasteryState(nodeId);
    return state?.isMastered || false;
  }

  // 获取掌握进度统计
  getMasteryProgress(totalNodes: number): {
    masteredCount: number;
    totalCount: number;
    percentage: number;
  } {
    const masteredCount = this.getAllMasteryStates().filter(state => state.isMastered).length;
    return {
      masteredCount,
      totalCount: totalNodes,
      percentage: totalNodes > 0 ? Math.round((masteredCount / totalNodes) * 100) : 0
    };
  }

  // 保存掌握状态到本地存储
  private saveMasteryStates(states: MasteryState[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
    } catch (error) {
      console.error('Error saving mastery states:', error);
    }
  }

  // 清除所有掌握状态（用于重置功能）
  clearAllMasteryStates(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing mastery states:', error);
    }
  }
}

export const masteryService = new MasteryService();
export default masteryService;
