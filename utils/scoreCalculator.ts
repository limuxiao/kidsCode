import { CodeBlock, StarRating } from '../types';

/**
 * 计算程序的总步数
 * - 左转、右转、攻击：各计 1 步
 * - 前进、后退：计实际移动步数（value 值）
 */
export const calculateTotalSteps = (program: CodeBlock[]): number => {
  let totalSteps = 0;

  for (const block of program) {
    switch (block.type) {
      case 'TURN_LEFT':
      case 'TURN_RIGHT':
      case 'ATTACK':
        totalSteps += 1;
        break;
      
      case 'FORWARD':
      case 'BACKWARD':
        totalSteps += (block.value as number) || 1;
        break;
      
      default:
        break;
    }
  }

  return totalSteps;
};

/**
 * 计算星级评分
 * - 3星：步数 <= 最优解（做得更好或相等）
 * - 2星：步数 <= 最优解 * 1.5
 * - 1星：步数 > 最优解 * 1.5
 * 
 * @param actualSteps 用户实际步数
 * @param optimalSteps 最优解步数
 * @returns 星级 (1-3)
 */
export const calculateStarRating = (
  actualSteps: number,
  optimalSteps: number
): StarRating => {
  // 步数小于等于最优解，给3星（包括做得更好的情况）
  if (actualSteps <= optimalSteps) {
    return 3; // 完美！
  }
  
  const threshold = optimalSteps * 1.5;
  
  if (actualSteps <= threshold) {
    return 2; // 不错！
  }
  
  return 1; // 完成了
};

/**
 * 获取星级评价文字
 */
export const getStarRatingText = (stars: StarRating): string => {
  switch (stars) {
    case 3:
      return '完美解法！';
    case 2:
      return '干得不错！';
    case 1:
      return '继续加油！';
  }
};

/**
 * 获取星级颜色
 */
export const getStarColor = (stars: StarRating): string => {
  switch (stars) {
    case 3:
      return 'text-yellow-400';
    case 2:
      return 'text-blue-400';
    case 1:
      return 'text-gray-400';
  }
};
