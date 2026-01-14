
import React from 'react';

export type Direction = 0 | 1 | 2 | 3; // 0: Up, 1: Right, 2: Down, 3: Left

export type BlockType = 
  // Movement (Maze)
  'FORWARD' | 'BACKWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'ATTACK' |
  // Potion (Magic Shop) - Basic
  'ADD_STARDUST' | 'ADD_FLAME' | 'ADD_SLIME' | 'ADD_HERB' | 'ADD_CRYSTAL' | 'STIR' |
  // Potion - Control Flow (Phase 2-4)
  'REPEAT' | 'REPEAT_UNTIL' | 'IF_CONTAINS' | 'IF_COLOR_IS' | 'IF_TEMPERATURE' |
  // Potion - Operations
  'SET_TEMPERATURE' | 'HEAT' | 'COOL' |
  // Potion - Functions
  'CREATE_RECIPE' | 'USE_RECIPE' |
  // Music
  'PLAY_NOTE' | 'REST';

export interface CodeBlock {
  id: string;
  type: BlockType;
  value?: number | string; // Steps, Color, or Note
  children?: CodeBlock[];      // 支持嵌套（循环、条件内的指令）
  condition?: ConditionType;   // 条件判断类型
  recipeName?: string;         // 配方名称
}

export type ConditionType = 
  | { type: 'CONTAINS'; ingredient: string }
  | { type: 'COLOR_IS'; color: string }
  | { type: 'TEMPERATURE'; min: number; max: number };

export type EntityType = 'PLAYER' | 'WALL' | 'ENEMY' | 'TREASURE' | 'EMPTY';

export interface Entity {
  type: EntityType;
  x: number;
  y: number;
  id?: string;
}

export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
}

export type Position = PlayerState;

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  gridSize: number;
  startPos: { x: number; y: number; direction: Direction };
  targetPos: { x: number; y: number };
  walls: { x: number; y: number }[];
  enemies: { x: number; y: number }[];
  availableBlocks: BlockType[]; 
}

// 💰 原料品质等级
export enum IngredientQuality {
  POOR = 'poor',       // 劣质 - 便宜但成功率低
  NORMAL = 'normal',   // 普通 - 标准价格和成功率
  PREMIUM = 'premium'  // 优质 - 贵但成功率高
}

// 原料类型
export type IngredientType = 'STARDUST' | 'FLAME' | 'SLIME' | 'HERB' | 'CRYSTAL';

// 原料信息（包含品质和价格）
export interface IngredientInfo {
  type: IngredientType;
  quality: IngredientQuality;
  basePrice: number;           // 基础价格
  currentPrice: number;        // 当前价格（考虑波动）
  successRateBonus: number;    // 品质影响成功率 (0.8-1.0)
  effectBonus: number;         // 效果加成（魔力、温度等）
}

// 💰 经济系统状态
export interface EconomyState {
  coins: number;                    // 当前金币
  totalEarned: number;              // 累计收益
  totalSpent: number;               // 累计支出
  currentOrderCost: number;         // 本次订单成本
  insurancePurchased: boolean;      // 是否购买保险
  insuranceCost: number;            // 保险费用
}

// 🎲 成功率系统
export interface SuccessRateState {
  baseRate: number;              // 基础成功率
  qualityModifier: number;       // 品质修正
  temperatureModifier: number;   // 温度修正
  complexityModifier: number;    // 复杂度修正
  overallRate: number;           // 综合成功率 (0-1)
  riskLevel: 'low' | 'medium' | 'high';  // 风险等级
}

// 药水属性状态
export interface PotionState {
  ingredients: IngredientType[];   // 已添加的原料
  color: string;                   // 颜色（基于原料混合）
  temperature: number;             // 温度 (0-200°C)
  magicPower: number;              // 魔力值 (0-200)
  isStirred: boolean;              // 是否已搅拌
  explosionRisk: number;           // 爆炸风险 (0-1)
}

// 失败类型
export enum FailureType {
  EXPLOSION = 'explosion',         // 爆炸（温度过高）
  FREEZE = 'freeze',              // 冻结（温度过低）
  CONTAMINATION = 'contamination', // 污染（劣质原料）
  INSTABILITY = 'instability'     // 不稳定（配方过于复杂）
}

export interface FailureResult {
  type: FailureType;
  message: string;
  coinLoss: number;              // 损失金币
  insuranceCovered: boolean;     // 保险是否覆盖
}

// Potion Shop Level Config (升级版)
export interface PotionLevelConfig {
  id: number;
  title: string;
  description: string;
  customerRequest: string; // Text displayed by customer
  targetRecipe: BlockType[]; // The sequence required
  availableBlocks: BlockType[];
  
  // 💰 经济系统配置
  economy: {
    initialCoins: number;         // 初始金币
    orderReward: number;          // 订单基础奖励
    budgetLimit?: number;         // 预算限制
    enableInsurance: boolean;     // 是否开放保险
    insuranceCost: number;        // 保险费用
  };
  
  // 🎲 风险系统配置
  riskSystem: {
    enableQualityChoice: boolean; // 是否允许选择原料品质
    showSuccessRate: boolean;     // 是否显示成功率
    penaltyOnFailure: number;     // 失败惩罚（金币）
    baseSuccessRate: number;      // 基础成功率
  };
}

export interface MusicLevelConfig {
  id: number;
  title: string;
  description: string;
  targetMelody: { note: string; duration: number }[];
  availableBlocks: BlockType[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
