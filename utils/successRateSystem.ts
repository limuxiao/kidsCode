/**
 * 🎲 成功率系统核心算法
 * 负责成功率计算、失败判定、风险评估
 */

import { 
  IngredientInfo, 
  PotionState, 
  SuccessRateState, 
  FailureType, 
  FailureResult,
  EconomyState 
} from '../types';
import { QUALITY_SUCCESS_RATE } from './economySystem';

/**
 * 计算综合成功率
 * 考虑：原料品质、温度控制、搅拌、复杂度
 */
export const calculateSuccessRate = (
  ingredients: IngredientInfo[],
  potionState: PotionState,
  baseRate: number = 1.0
): SuccessRateState => {
  // 1. 原料品质影响
  const qualityModifier = ingredients.reduce(
    (acc, ing) => acc * ing.successRateBonus,
    1.0
  );
  
  // 2. 温度控制影响（理想温度：50-70°C）
  let temperatureModifier = 1.0;
  const temp = potionState.temperature;
  
  if (temp < 30) {
    temperatureModifier = 0.6; // 太冷
  } else if (temp < 50) {
    temperatureModifier = 0.8; // 偏冷
  } else if (temp <= 70) {
    temperatureModifier = 1.0; // 理想
  } else if (temp <= 90) {
    temperatureModifier = 0.8; // 偏热
  } else if (temp <= 120) {
    temperatureModifier = 0.6; // 太热
  } else {
    temperatureModifier = 0.3; // 危险高温
  }
  
  // 3. 搅拌影响
  const stirModifier = potionState.isStirred ? 1.0 : 0.6;
  
  // 4. 复杂度影响（原料越多越难控制）
  const complexityModifier = Math.max(
    0.7, 
    1 - (ingredients.length - 1) * 0.05
  );
  
  // 综合计算
  const overallRate = Math.min(
    1.0,
    Math.max(
      0,
      baseRate * qualityModifier * temperatureModifier * stirModifier * complexityModifier
    )
  );
  
  // 风险等级
  let riskLevel: 'low' | 'medium' | 'high';
  if (overallRate >= 0.9) riskLevel = 'low';
  else if (overallRate >= 0.7) riskLevel = 'medium';
  else riskLevel = 'high';
  
  return {
    baseRate,
    qualityModifier,
    temperatureModifier,
    complexityModifier: complexityModifier * stirModifier,
    overallRate,
    riskLevel
  };
};

/**
 * 执行成功率判定（投骰子）
 */
export const rollSuccessCheck = (successRate: number): boolean => {
  return Math.random() <= successRate;
};

/**
 * 根据药水状态判断失败原因
 */
export const determineFailureType = (potionState: PotionState): FailureType => {
  const temp = potionState.temperature;
  
  if (temp > 120) {
    return FailureType.EXPLOSION;
  } else if (temp < 20) {
    return FailureType.FREEZE;
  } else if (potionState.explosionRisk > 0.7) {
    return FailureType.INSTABILITY;
  } else {
    return FailureType.CONTAMINATION;
  }
};

/**
 * 生成失败结果
 */
export const generateFailureResult = (
  failureType: FailureType,
  economyState: EconomyState,
  potionState: PotionState
): FailureResult => {
  const messages: Record<FailureType, string> = {
    [FailureType.EXPLOSION]: '💥 温度过高！药水爆炸了！',
    [FailureType.FREEZE]: '❄️ 温度过低！药水冻结了！',
    [FailureType.CONTAMINATION]: '🤢 原料品质不佳，药水被污染了！',
    [FailureType.INSTABILITY]: '⚠️ 配方太复杂，药水不稳定！'
  };
  
  const coinLoss = economyState.insurancePurchased
    ? economyState.currentOrderCost * 0.5  // 保险覆盖50%
    : economyState.currentOrderCost;
  
  return {
    type: failureType,
    message: messages[failureType],
    coinLoss,
    insuranceCovered: economyState.insurancePurchased
  };
};

/**
 * 获取风险等级的颜色和文字
 */
export const getRiskLevelDisplay = (riskLevel: 'low' | 'medium' | 'high'): {
  color: string;
  bgColor: string;
  text: string;
  emoji: string;
} => {
  const displays = {
    low: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      text: '低风险',
      emoji: '✅'
    },
    medium: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      text: '中风险',
      emoji: '⚠️'
    },
    high: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      text: '高风险',
      emoji: '🔥'
    }
  };
  
  return displays[riskLevel];
};

/**
 * 计算爆炸风险
 */
export const calculateExplosionRisk = (
  potionState: PotionState,
  ingredients: IngredientInfo[]
): number => {
  let risk = 0;
  
  // 温度风险
  if (potionState.temperature > 100) {
    risk += (potionState.temperature - 100) / 100;
  }
  
  // 魔力值过高
  if (potionState.magicPower > 150) {
    risk += (potionState.magicPower - 150) / 50;
  }
  
  // 未搅拌的复杂配方
  if (!potionState.isStirred && ingredients.length >= 3) {
    risk += 0.3;
  }
  
  // 劣质原料增加不稳定性
  const poorQualityCount = ingredients.filter(
    ing => ing.quality === 'poor'
  ).length;
  risk += poorQualityCount * 0.1;
  
  return Math.min(1, Math.max(0, risk));
};

/**
 * 获取成功率反馈文本
 */
export const getSuccessRateFeedback = (successRate: number): string => {
  if (successRate >= 0.95) return '几乎必定成功！';
  if (successRate >= 0.9) return '成功率很高！';
  if (successRate >= 0.8) return '有较高的成功概率。';
  if (successRate >= 0.7) return '成功率一般，有一定风险。';
  if (successRate >= 0.6) return '风险较高，需要小心。';
  if (successRate >= 0.5) return '成功率低，建议优化配方。';
  return '⚠️ 成功率极低，失败概率很大！';
};

/**
 * 简化版成功率计算（用于快速预览）
 */
export const quickCalculateSuccessRate = (
  ingredients: IngredientInfo[]
): number => {
  if (ingredients.length === 0) return 1.0;
  
  const qualityFactor = ingredients.reduce(
    (acc, ing) => acc * ing.successRateBonus,
    1.0
  );
  
  const complexityFactor = Math.max(0.8, 1 - (ingredients.length - 1) * 0.05);
  
  return Math.min(1.0, qualityFactor * complexityFactor);
};
