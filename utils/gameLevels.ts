/**
 * 🎮 魔法药水店关卡配置系统（改版2.0）
 * 25关完整设计，循序渐进引入：
 * - 关卡 1-3: 基础序列（无价格/风险）
 * - 关卡 4-6: 引入价格系统
 * - 关卡 7-9: 批量优化
 * - 关卡 10-12: 引入成功率系统
 * - 关卡 13-18: 风险收益权衡
 * - 关卡 19-21: 保险和期望值
 * - 关卡 22-25: 综合挑战
 */

import { PotionLevelConfig, BlockType, IngredientType } from '../types';

// 原料类型映射
const INGREDIENT_BLOCKS: Record<IngredientType, BlockType> = {
  STARDUST: 'ADD_STARDUST',
  FLAME: 'ADD_FLAME',
  SLIME: 'ADD_SLIME',
  HERB: 'ADD_HERB',
  CRYSTAL: 'ADD_CRYSTAL'
};

const INGREDIENT_NAMES: Record<IngredientType, string> = {
  STARDUST: '星尘',
  FLAME: '熔岩',
  SLIME: '粘液',
  HERB: '草药',
  CRYSTAL: '冰晶'
};

/**
 * 🎯 关卡 1-3: 基础学习（无经济压力）
 */
const LEVELS_1_3: PotionLevelConfig[] = [
  {
    id: 1,
    title: '魔法学徒',
    description: '欢迎来到魔法药水店！学习基础配方制作。',
    customerRequest: '你好！我想要一瓶纯粹的星尘药水。',
    targetRecipe: ['ADD_STARDUST', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'STIR'],
    economy: {
      initialCoins: 100,
      orderReward: 30,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: false,
      showSuccessRate: false,
      penaltyOnFailure: 0,
      baseSuccessRate: 1.0  // 100% 成功
    }
  },
  {
    id: 2,
    title: '混合实验',
    description: '学习混合两种原料。顺序很重要！',
    customerRequest: '我需要星尘和熔岩的混合药剂。',
    targetRecipe: ['ADD_STARDUST', 'ADD_FLAME', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'STIR'],
    economy: {
      initialCoins: 100,
      orderReward: 50,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: false,
      showSuccessRate: false,
      penaltyOnFailure: 0,
      baseSuccessRate: 1.0
    }
  },
  {
    id: 3,
    title: '三重奏',
    description: '掌握三种原料的调配。',
    customerRequest: '我要一个包含星尘、粘液和草药的复杂配方。',
    targetRecipe: ['ADD_STARDUST', 'ADD_SLIME', 'ADD_HERB', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'ADD_CRYSTAL', 'STIR'],
    economy: {
      initialCoins: 100,
      orderReward: 80,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: false,
      showSuccessRate: false,
      penaltyOnFailure: 0,
      baseSuccessRate: 1.0
    }
  }
];

/**
 * 💰 关卡 4-6: 价格系统引入
 */
const LEVELS_4_6: PotionLevelConfig[] = [
  {
    id: 4,
    title: '精打细算',
    description: '🆕 现在需要考虑成本了！选择合适的原料品质。',
    customerRequest: '我有50金币预算，请帮我调制星尘药水。',
    targetRecipe: ['ADD_STARDUST', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'STIR'],
    economy: {
      initialCoins: 100,
      orderReward: 60,
      budgetLimit: 50,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: true,   // 🆕 可以选择品质
      showSuccessRate: false,
      penaltyOnFailure: 0,
      baseSuccessRate: 1.0
    }
  },
  {
    id: 5,
    title: '利润最大化',
    description: '在预算内，追求最高利润！',
    customerRequest: '我需要熔岩和草药的混合药剂，预算80金币。',
    targetRecipe: ['ADD_FLAME', 'ADD_HERB', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'STIR'],
    economy: {
      initialCoins: 150,
      orderReward: 100,
      budgetLimit: 80,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: false,
      penaltyOnFailure: 0,
      baseSuccessRate: 1.0
    }
  },
  {
    id: 6,
    title: '经济危机',
    description: '金币不多了！必须精打细算。',
    customerRequest: '三种原料的复杂配方，但我预算有限（60金币）。',
    targetRecipe: ['ADD_SLIME', 'ADD_HERB', 'ADD_STARDUST', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'ADD_CRYSTAL', 'STIR'],
    economy: {
      initialCoins: 80,
      orderReward: 90,
      budgetLimit: 60,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: false,
      penaltyOnFailure: 0,
      baseSuccessRate: 1.0
    }
  }
];

/**
 * 🎲 关卡 10-12: 成功率系统引入
 */
const LEVELS_10_12: PotionLevelConfig[] = [
  {
    id: 10,
    title: '风险投资',
    description: '🆕 原料品质影响成功率！劣质便宜但可能失败。',
    customerRequest: '我需要星尘药水，愿意为成功付150金币！',
    targetRecipe: ['ADD_STARDUST', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'STIR'],
    economy: {
      initialCoins: 100,
      orderReward: 150,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,      // 🆕 显示成功率
      penaltyOnFailure: 50,        // 🆕 失败惩罚
      baseSuccessRate: 1.0
    }
  },
  {
    id: 11,
    title: '赌徒的选择',
    description: '高风险高回报，还是稳健经营？',
    customerRequest: '熔岩和冰晶的药剂，成功奖励200金币！',
    targetRecipe: ['ADD_FLAME', 'ADD_CRYSTAL', 'STIR'],
    availableBlocks: ['ADD_FLAME', 'ADD_CRYSTAL', 'ADD_HERB', 'STIR'],
    economy: {
      initialCoins: 150,
      orderReward: 200,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 80,
      baseSuccessRate: 0.95
    }
  },
  {
    id: 12,
    title: '期望值计算',
    description: '学习计算期望收益，做出最优决策。',
    customerRequest: '复杂配方，失败会损失惨重！',
    targetRecipe: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'STIR'],
    economy: {
      initialCoins: 200,
      orderReward: 250,
      enableInsurance: false,
      insuranceCost: 0
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 100,
      baseSuccessRate: 0.9
    }
  }
];

/**
 * 🛡️ 关卡 19-21: 保险系统
 */
const LEVELS_19_21: PotionLevelConfig[] = [
  {
    id: 19,
    title: '保险的价值',
    description: '🆕 可以购买保险！失败时退回50%成本。',
    customerRequest: '高风险订单，建议购买保险！',
    targetRecipe: ['ADD_CRYSTAL', 'ADD_FLAME', 'STIR'],
    availableBlocks: ['ADD_CRYSTAL', 'ADD_FLAME', 'ADD_SLIME', 'STIR'],
    economy: {
      initialCoins: 200,
      orderReward: 300,
      enableInsurance: true,       // 🆕 开放保险
      insuranceCost: 30
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 120,
      baseSuccessRate: 0.85
    }
  },
  {
    id: 20,
    title: '最优策略',
    description: '计算何时买保险划算。',
    customerRequest: '三种高价原料，失败代价很大！',
    targetRecipe: ['ADD_CRYSTAL', 'ADD_FLAME', 'ADD_STARDUST', 'STIR'],
    availableBlocks: ['ADD_CRYSTAL', 'ADD_FLAME', 'ADD_STARDUST', 'ADD_HERB', 'STIR'],
    economy: {
      initialCoins: 300,
      orderReward: 400,
      enableInsurance: true,
      insuranceCost: 40
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 150,
      baseSuccessRate: 0.8
    }
  },
  {
    id: 21,
    title: '连续风险',
    description: '多次尝试，如何管理风险？',
    customerRequest: '四种原料的终极配方！',
    targetRecipe: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_CRYSTAL', 'ADD_HERB', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_CRYSTAL', 'ADD_HERB', 'ADD_SLIME', 'STIR'],
    economy: {
      initialCoins: 400,
      orderReward: 500,
      enableInsurance: true,
      insuranceCost: 50
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 200,
      baseSuccessRate: 0.75
    }
  }
];

/**
 * 🏆 关卡 22-25: 终极挑战
 */
const LEVELS_22_25: PotionLevelConfig[] = [
  {
    id: 22,
    title: '大师考验',
    description: '综合运用所有技能！',
    customerRequest: '传说中的五元素药剂！',
    targetRecipe: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'ADD_CRYSTAL', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'ADD_CRYSTAL', 'STIR'],
    economy: {
      initialCoins: 500,
      orderReward: 800,
      enableInsurance: true,
      insuranceCost: 80
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 300,
      baseSuccessRate: 0.7
    }
  },
  {
    id: 23,
    title: '经济大亨',
    description: '在有限资源下实现利润最大化！',
    customerRequest: '复杂订单，预算紧张！',
    targetRecipe: ['ADD_CRYSTAL', 'ADD_STARDUST', 'ADD_FLAME', 'STIR'],
    availableBlocks: ['ADD_CRYSTAL', 'ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'STIR'],
    economy: {
      initialCoins: 300,
      orderReward: 600,
      budgetLimit: 200,
      enableInsurance: true,
      insuranceCost: 60
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 250,
      baseSuccessRate: 0.75
    }
  },
  {
    id: 24,
    title: '风险管理专家',
    description: '极低成功率，如何应对？',
    customerRequest: '这是一个几乎不可能的配方...',
    targetRecipe: ['ADD_FLAME', 'ADD_CRYSTAL', 'ADD_SLIME', 'STIR'],
    availableBlocks: ['ADD_FLAME', 'ADD_CRYSTAL', 'ADD_SLIME', 'ADD_HERB', 'STIR'],
    economy: {
      initialCoins: 600,
      orderReward: 1000,
      enableInsurance: true,
      insuranceCost: 100
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 400,
      baseSuccessRate: 0.6
    }
  },
  {
    id: 25,
    title: '传奇药剂师',
    description: '🏆 终极挑战！证明你是最强药剂师！',
    customerRequest: '国王的订单：完美的药剂，不能失败！',
    targetRecipe: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'ADD_CRYSTAL', 'STIR'],
    availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'ADD_HERB', 'ADD_CRYSTAL', 'STIR'],
    economy: {
      initialCoins: 1000,
      orderReward: 1500,
      enableInsurance: true,
      insuranceCost: 150
    },
    riskSystem: {
      enableQualityChoice: true,
      showSuccessRate: true,
      penaltyOnFailure: 500,
      baseSuccessRate: 0.65
    }
  }
];

// 占位关卡（7-9, 13-18）- 后续实现
const generatePlaceholderLevel = (id: number): PotionLevelConfig => ({
  id,
  title: `第 ${id} 关`,
  description: '关卡开发中...',
  customerRequest: '这是一个开发中的关卡。',
  targetRecipe: ['ADD_STARDUST', 'STIR'],
  availableBlocks: ['ADD_STARDUST', 'ADD_FLAME', 'STIR'],
  economy: {
    initialCoins: 200,
    orderReward: 100,
    enableInsurance: false,
    insuranceCost: 0
  },
  riskSystem: {
    enableQualityChoice: id >= 4,
    showSuccessRate: id >= 10,
    penaltyOnFailure: 0,
    baseSuccessRate: 1.0
  }
});

/**
 * 获取指定关卡配置
 */
export const getPotionLevel = (levelId: number): PotionLevelConfig => {
  const allLevels = [
    ...LEVELS_1_3,
    ...LEVELS_4_6,
    ...[7, 8, 9].map(generatePlaceholderLevel),
    ...LEVELS_10_12,
    ...[13, 14, 15, 16, 17, 18].map(generatePlaceholderLevel),
    ...LEVELS_19_21,
    ...LEVELS_22_25
  ];

  const level = allLevels.find(l => l.id === levelId);
  return level || allLevels[0];
};

/**
 * 已弃用：保留兼容性
 */
export const generatePotionLevel = (levelId: number): PotionLevelConfig => {
  return getPotionLevel(levelId);
};

// 音乐关卡配置（保持原有实现）
export const MUSIC_LEVELS = [
  {
    id: 1,
    title: "简单的音阶",
    description: "试试看！按照 C4, D4, E4 的顺序弹奏。",
    targetMelody: [
      { note: 'C4', duration: 1 },
      { note: 'D4', duration: 1 },
      { note: 'E4', duration: 1 }
    ],
    availableBlocks: ['PLAY_NOTE' as BlockType]
  },
  {
    id: 2,
    title: "小星星（片段）",
    description: "你能拼出'一闪一闪亮晶晶'的前半句吗？(C4 C4 G4 G4)",
    targetMelody: [
      { note: 'C4', duration: 1 },
      { note: 'C4', duration: 1 },
      { note: 'G4', duration: 1 },
      { note: 'G4', duration: 1 },
    ],
    availableBlocks: ['PLAY_NOTE' as BlockType, 'REST' as BlockType]
  },
  {
    id: 3,
    title: "音高跳跃",
    description: "让我们从低音 C4 直接跳到高音 C5！",
    targetMelody: [
      { note: 'C4', duration: 1 },
      { note: 'E4', duration: 1 },
      { note: 'G4', duration: 1 },
      { note: 'C5', duration: 2 },
    ],
    availableBlocks: ['PLAY_NOTE' as BlockType, 'REST' as BlockType]
  }
];
