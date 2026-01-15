// IndexedDB 游戏进度管理工具

import { LevelScore } from '../types';

interface GameProgress {
  gameId: string;
  currentLevel: number;
  completedLevels: number[];
  levelScores: Record<number, LevelScore>; // 每关的星级评分
  lastPlayedAt: number;
}

const DB_NAME = 'KidsCodeGamesDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameProgress';

class GameProgressDB {
  private db: IDBDatabase | null = null;

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储空间
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'gameId' });
          objectStore.createIndex('lastPlayedAt', 'lastPlayedAt', { unique: false });
        }
      };
    });
  }

  // 保存游戏进度
  async saveProgress(
    gameId: string, 
    currentLevel: number, 
    completedLevels: number[],
    levelScores: Record<number, LevelScore> = {}
  ): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      const progress: GameProgress = {
        gameId,
        currentLevel,
        completedLevels,
        levelScores,
        lastPlayedAt: Date.now()
      };

      const request = objectStore.put(progress);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save progress'));
    });
  }

  // 保存单个关卡星级评分
  async saveLevelScore(gameId: string, levelScore: LevelScore): Promise<void> {
    if (!this.db) await this.init();

    // 先获取现有进度
    const progress = await this.getProgress(gameId);
    if (!progress) {
      throw new Error('Game progress not found');
    }

    // 更新星级评分（只保留最高分）
    const currentScore = progress.levelScores[levelScore.levelId];
    if (!currentScore || levelScore.stars > currentScore.stars) {
      progress.levelScores[levelScore.levelId] = levelScore;
    }

    // 保存回数据库
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(progress);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save level score'));
    });
  }

  // 获取游戏进度
  async getProgress(gameId: string): Promise<GameProgress | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(gameId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(new Error('Failed to get progress'));
    });
  }

  // 清除游戏进度
  async clearProgress(gameId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(gameId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear progress'));
    });
  }

  // 获取所有游戏进度
  async getAllProgress(): Promise<GameProgress[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => reject(new Error('Failed to get all progress'));
    });
  }
}

// 导出单例
export const gameProgressDB = new GameProgressDB();

// 导出类型
export type { GameProgress };
