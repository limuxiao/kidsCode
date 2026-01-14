/**
 * 💰 经济系统核心算法
 * 负责价格计算、成本优化、期望收益分析
 */

import { IngredientType, IngredientQuality, IngredientInfo, EconomyState } from '../types';

// 原料基础价格表
export const INGREDIENT_BASE_PRICES: Record<IngredientType, Record<IngredientQuality, number>> = {
  STARDUST: {
    poor: 5,
    normal: 10,
    premium: 15
  },
  FLAME: {
    poor: 8,
    normal: 15,
    premium: 22
  },
  SLIME: {
    poor: 3,
    normal: 8,
    premium: 12
  },
  HERB: {
    poor: 3,
    normal: 8,
    premium: 12
  },
  CRYSTAL: {
    poor: 12,
    normal: 20,
    premium: 30
  }
};

// 品质对成功率的影响
export const QUALITY_SUCCESS_RATE: Record<IngredientQuality, number> = {
  poor: 0.8,      // 劣质：-20%
  normal: 1.0,    // 普通：标准
  premium: 1.0    // 优质：标准（不提升成功率，但提供其他加成）
};

/**
 * 计算配方总成本
 */
export const calculateRecipeCost = (
  ingredients: IngredientInfo[],
  priceFluctuation: number = 1.0  // 价格波动系数 (0.8-1.2)
): number => {
  let totalCost = 0;
  
  for (const ingredient of ingredients) {
    const actualPrice = ingredient.currentPrice * priceFluctuation;
    totalCost += actualPrice;
  }
  
  return Math.round(totalCost);
};

/**
 * 计算期望收益（考虑成功率）
 * E = P(成功) × 成功收益 + P(失败) × 失败损失
 */
export const calculateExpectedProfit = (
  cost: number,
  reward: number,
  successRate: number,
  insuranceCost: number = 0,
  hasInsurance: boolean = false
): number => {
  const successProfit = reward - cost - insuranceCost;
  
  // 有保险：失败时退回50%成本
  const failureLoss = hasInsurance 
    ? -(cost * 0.5) - insuranceCost 
    : -cost - insuranceCost;
  
  const expectedValue = 
    successRate * successProfit + 
    (1 - successRate) * failureLoss;
  
  return Math.round(expectedValue * 10) / 10; // 保留1位小数
};

/**
 * 计算保险价值
 * 判断购买保险是否划算
 */
export const calculateInsuranceValue = (
  cost: number,
  successRate: number,
  insuranceCost: number
): {
  worthIt: boolean;
  savings: number;
  breakEvenRate: number;
  recommendation: string;
} => {
  // 不买保险的期望损失
  const expectedLossWithout = cost * (1 - successRate);
  
  // 买保险的期望损失
  const expectedLossWith = insuranceCost + (cost * 0.5 * (1 - successRate));
  
  const worthIt = expectedLossWith < expectedLossWithout;
  const savings = expectedLossWithout - expectedLossWith;
  
  // 临界成功率：当成功率低于此值时，买保险划算
  const breakEvenRate = 1 - (insuranceCost / (cost * 0.5));
  
  const recommendation = worthIt
    ? `✅ 建议购买保险，可节省期望损失 ${Math.abs(savings).toFixed(1)} 金币`
    : `❌ 不建议购买保险，期望多损失 ${Math.abs(savings).toFixed(1)} 金币`;
  
  return {
    worthIt,
    savings,
    breakEvenRate: Math.max(0, Math.min(1, breakEvenRate)),
    recommendation
  };
};

/**
 * 生成优化建议
 * 对比不同品质原料的方案
 */
export interface RecipeOption {
  ingredients: IngredientInfo[];
  cost: number;
  successRate: number;
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  label: string;
}

export const generateOptimizationSuggestion = (
  ingredientTypes: IngredientType[],
  reward: number,
  baseSuccessRate: number,
  calculateSuccessRateFn: (ingredients: IngredientInfo[]) => number
): {
  conservative: RecipeOption;  // 保守方案（优质）
  balanced: RecipeOption;      // 平衡方案（普通）
  aggressive: RecipeOption;    // 激进方案（劣质）
} => {
  const createOption = (quality: IngredientQuality, label: string): RecipeOption => {
    const ingredients: IngredientInfo[] = ingredientTypes.map(type => ({
      type,
      quality,
      basePrice: INGREDIENT_BASE_PRICES[type][quality],
      currentPrice: INGREDIENT_BASE_PRICES[type][quality],
      successRateBonus: QUALITY_SUCCESS_RATE[quality],
      effectBonus: quality === 'premium' ? 1.2 : quality === 'normal' ? 1.0 : 0.8
    }));
    
    const cost = calculateRecipeCost(ingredients);
    const successRate = calculateSuccessRateFn(ingredients);
    const expectedProfit = calculateExpectedProfit(cost, reward, successRate);
    
    let riskLevel: 'low' | 'medium' | 'high';
    if (successRate >= 0.9) riskLevel = 'low';
    else if (successRate >= 0.7) riskLevel = 'medium';
    else riskLevel = 'high';
    
    return {
      ingredients,
      cost,
      successRate,
      expectedProfit,
      riskLevel,
      label
    };
  };
  
  return {
    conservative: createOption('premium', '保守方案'),
    balanced: createOption('normal', '平衡方案'),
    aggressive: createOption('poor', '激进方案')
  };
};

/**
 * 初始化经济状态
 */
export const initEconomyState = (initialCoins: number): EconomyState => ({
  coins: initialCoins,
  totalEarned: 0,
  totalSpent: 0,
  currentOrderCost: 0,
  insurancePurchased: false,
  insuranceCost: 0
});

/**
 * 更新经济状态（购买原料）
 */
export const purchaseIngredients = (
  state: EconomyState,
  cost: number
): EconomyState => ({
  ...state,
  coins: state.coins - cost,
  totalSpent: state.totalSpent + cost,
  currentOrderCost: state.currentOrderCost + cost
});

/**
 * 更新经济状态（成功完成订单）
 */
export const completeOrder = (
  state: EconomyState,
  reward: number
): EconomyState => ({
  ...state,
  coins: state.coins + reward,
  totalEarned: state.totalEarned + reward,
  currentOrderCost: 0,
  insurancePurchased: false,
  insuranceCost: 0
});

/**
 * 更新经济状态（失败）
 */
export const handleOrderFailure = (
  state: EconomyState
): EconomyState => {
  // 如果买了保险，退回50%成本
  const refund = state.insurancePurchased ? state.currentOrderCost * 0.5 : 0;
  
  return {
    ...state,
    coins: state.coins + refund,
    currentOrderCost: 0,
    insurancePurchased: false,
    insuranceCost: 0
  };
};
