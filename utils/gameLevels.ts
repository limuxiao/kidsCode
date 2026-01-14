
import { PotionLevelConfig, MusicLevelConfig, BlockType } from '../types';

// Helper to pick N unique random items from an array
const pickRandomUnique = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const INGREDIENTS: { type: BlockType; name: string }[] = [
  { type: 'ADD_STARDUST', name: '星尘' },
  { type: 'ADD_FLAME', name: '熔岩' },
  { type: 'ADD_SLIME', name: '粘液' },
  { type: 'ADD_HERB', name: '草药' },
  { type: 'ADD_CRYSTAL', name: '冰晶' },
];

const CUSTOMER_TEMPLATES = [
  "我想要一瓶{A}和{B}混合的药剂。",
  "听说{A}加上{B}效果很好？",
  "我需要{A}、{B}还有{C}的力量！",
  "只要加点{A}就行了。",
  "请把{A}和{B}完美的融合在一起。"
];

export const generatePotionLevel = (levelId: number): PotionLevelConfig => {
  // Difficulty Scaling
  let numIngredients = 1;
  if (levelId >= 2) numIngredients = 2;
  if (levelId >= 4) numIngredients = 3;
  
  // 1. Select Unique Ingredients for this recipe
  // We use the full pool to ensure variety, but pick unique ones for the recipe
  const recipeIngredients = pickRandomUnique(INGREDIENTS, numIngredients);
  
  // 2. Build Target Recipe (Sequence)
  // Always end with Stir
  const targetRecipe: BlockType[] = [...recipeIngredients.map(i => i.type), 'STIR'];

  // 3. Determine Available Blocks (Toolbox)
  // Always give Stardust, Flame, Slime + any specific ones needed for this level + Stir
  const baseBlocks: BlockType[] = ['ADD_STARDUST', 'ADD_FLAME', 'ADD_SLIME', 'STIR'];
  const recipeBlockTypes = recipeIngredients.map(i => i.type);
  
  // Ensure all needed blocks are available
  const availableSet = new Set([...baseBlocks, ...recipeBlockTypes]);
  
  // If level is high, add distractors (unused ingredients)
  if (levelId >= 3) {
      INGREDIENTS.forEach(ing => availableSet.add(ing.type));
  }
  
  const availableBlocks = Array.from(availableSet);

  // 4. Generate Customer Request text
  let customerRequest = "";
  const names = recipeIngredients.map(i => i.name);
  
  if (numIngredients === 1) {
      customerRequest = `你好！我只想要一点纯粹的${names[0]}药水。`;
  } else if (numIngredients === 2) {
      customerRequest = `我想要一瓶由${names[0]}和${names[1]}混合而成的药剂。`;
  } else {
      customerRequest = `这是一个复杂的配方：先加${names[0]}，再加${names[1]}，最后放入${names[2]}。`;
  }

  const titles = ["初级学徒", "混合实验", "魔法师的考验", "大师级配方", "传说中的药剂"];
  const title = levelId <= 5 ? titles[levelId-1] : `第 ${levelId} 位顾客`;

  return {
    id: levelId,
    title,
    description: "听听顾客的需求，按顺序加入不同的原料（不可重复），最后搅拌。",
    customerRequest,
    targetRecipe,
    availableBlocks
  };
};

export const MUSIC_LEVELS: MusicLevelConfig[] = [
  {
    id: 1,
    title: "简单的音阶",
    description: "试试看！按照 C4, D4, E4 的顺序弹奏。",
    targetMelody: [
      { note: 'C4', duration: 1 },
      { note: 'D4', duration: 1 },
      { note: 'E4', duration: 1 }
    ],
    availableBlocks: ['PLAY_NOTE']
  },
  {
    id: 2,
    title: "小星星（片段）",
    description: "你能拼出“一闪一闪亮晶晶”的前半句吗？(C4 C4 G4 G4)",
    targetMelody: [
      { note: 'C4', duration: 1 },
      { note: 'C4', duration: 1 },
      { note: 'G4', duration: 1 },
      { note: 'G4', duration: 1 },
    ],
    availableBlocks: ['PLAY_NOTE', 'REST']
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
    availableBlocks: ['PLAY_NOTE', 'REST']
  }
];
