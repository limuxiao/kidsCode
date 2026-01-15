
import { LevelConfig, Direction, BlockType } from '../types';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePath = (gridSize: number, start: {x: number, y: number}, target: {x: number, y: number}) => {
  const path: {x: number, y: number}[] = [];
  let current = { ...start };
  path.push({ ...current });

  // Simple random walk towards target
  // To make it more interesting, sometimes deviate? For now, straightest random path.
  // Actually, strictly shortest path might be boring. Let's do a slightly randomized approach.
  // But to guarantee solvability easily, let's just do Manhattan movement.
  
  while (current.x !== target.x || current.y !== target.y) {
    const moves = [];
    if (current.x < target.x) moves.push({ dx: 1, dy: 0 });
    if (current.x > target.x) moves.push({ dx: -1, dy: 0 });
    if (current.y < target.y) moves.push({ dx: 0, dy: 1 });
    if (current.y > target.y) moves.push({ dx: 0, dy: -1 });

    // Allow some perpendicular moves if we are far enough (to create corners)
    // But be careful not to go out of bounds or loop. 
    // Stick to semi-direct for now.
    
    const move = moves[randomInt(0, moves.length - 1)];
    current.x += move.dx;
    current.y += move.dy;
    path.push({ ...current });
  }
  return path;
};

export const generateLevel = (levelId: number): LevelConfig => {
  // 1. Difficulty Parameters
  // Size grows every 5 levels, max 8
  const gridSize = Math.min(5 + Math.floor((levelId - 1) / 5), 8); 
  
  // Wall density increases with level
  const wallDensity = Math.min(0.1 + (levelId * 0.02), 0.3);
  const numWalls = Math.floor(gridSize * gridSize * wallDensity);
  
  // Enemies start appearing at level 4
  let numEnemies = 0;
  if (levelId >= 4) {
    numEnemies = Math.min(Math.floor((levelId - 3) / 2) + 1, 4);
  }

  // 2. Setup Board
  // Random start and target
  // Ensure manhattan distance is decent
  let startPos, targetPos;
  let attempts = 0;
  do {
      startPos = { 
          x: randomInt(0, gridSize - 1), 
          y: randomInt(0, gridSize - 1), 
          direction: 1 as Direction // Default Right, adjusted later
      };
      targetPos = { 
          x: randomInt(0, gridSize - 1), 
          y: randomInt(0, gridSize - 1) 
      };
      attempts++;
  } while (
      (Math.abs(startPos.x - targetPos.x) + Math.abs(startPos.y - targetPos.y) < gridSize/1.5) 
      && attempts < 100
  );

  // Adjust start direction to face towards target roughly
  if (targetPos.x > startPos.x) startPos.direction = 1; // Right
  else if (targetPos.x < startPos.x) startPos.direction = 3; // Left
  else if (targetPos.y > startPos.y) startPos.direction = 2; // Down
  else startPos.direction = 0; // Up


  // 3. Generate Solution Path (Safe Zone)
  const path = generatePath(gridSize, startPos, targetPos);
  const pathSet = new Set(path.map(p => `${p.x},${p.y}`));

  // 4. Place Walls
  const walls: {x: number, y: number}[] = [];
  for (let i = 0; i < numWalls; i++) {
      let wx, wy;
      let wallAttempts = 0;
      do {
          wx = randomInt(0, gridSize - 1);
          wy = randomInt(0, gridSize - 1);
          wallAttempts++;
      } while (
          (pathSet.has(`${wx},${wy}`) || 
           (wx === startPos.x && wy === startPos.y) || 
           (wx === targetPos.x && wy === targetPos.y) ||
           walls.some(w => w.x === wx && w.y === wy))
          && wallAttempts < 50
      );
      
      if (wallAttempts < 50) {
          walls.push({x: wx, y: wy});
      }
  }

  // 5. Place Enemies (On the path to force conflict)
  const enemies: {x: number, y: number}[] = [];
  if (numEnemies > 0) {
      // Filter path for valid enemy spots (not start, not end)
      const validEnemySpots = path.filter((p, i) => i > 1 && i < path.length - 1);
      
      for (let i = 0; i < numEnemies; i++) {
          if (validEnemySpots.length === 0) break;
          const idx = randomInt(0, validEnemySpots.length - 1);
          const spot = validEnemySpots[idx];
          
          if (!enemies.some(e => e.x === spot.x && e.y === spot.y)) {
              enemies.push(spot);
              validEnemySpots.splice(idx, 1);
          }
      }
  }

  // 6. Available Blocks
  const blocks: BlockType[] = ['FORWARD'];
  
  // Level 1 is usually straight, but random gen might make it turn.
  // To keep Level 1 simple, we might want to force a straight line, but user asked for random content.
  // Let's just enable turns from Level 2 or if path requires it?
  // Simplest: Level 1 has Forward. Level 2+ has Turns. Level 3+ Backward.
  // If we generate a path that requires turns in Level 1, it's bad.
  
  // Override for Level 1 to be strictly straight
  if (levelId === 1) {
      // Force straight line logic for Level 1
      startPos = { x: 0, y: randomInt(0, gridSize-1), direction: 1 };
      targetPos = { x: gridSize-1, y: startPos.y };
      pathSet.clear(); // Clear previous path set
      walls.length = 0; // Clear walls
      enemies.length = 0;
      blocks.length = 0; 
      blocks.push('FORWARD');
  } else {
      blocks.push('TURN_LEFT', 'TURN_RIGHT');
      if (levelId >= 3) blocks.push('BACKWARD');
      if (enemies.length > 0) blocks.push('ATTACK');
  }

  // Titles
  const titles = [
      "探险开始", "迷宫行者", "智慧转弯", "勇闯难关", "寻宝大师", "无尽挑战"
  ];
  const title = levelId <= 5 ? titles[levelId - 1] : `第 ${levelId} 层迷宫`;
  
  let description = "使用指令到达终点！";
  if (levelId === 1) description = "这是你的第一次探险！直走就能拿到宝箱。";
  else if (levelId === 2) description = "路变弯了，学会使用左转和右转吧。";
  else if (enemies.length > 0) description = "注意！前方有怪物，使用攻击指令消灭它们！";
  else if (walls.length > 0) description = "小心避开墙壁，找到正确的路。";

  // 计算最优步数（基于曼哈顿距离和转向）
  const calculateOptimalSteps = (): number => {
    let steps = 0;
    
    // 曼哈顿距离
    const manhattanDistance = Math.abs(targetPos.x - startPos.x) + Math.abs(targetPos.y - startPos.y);
    steps += manhattanDistance;
    
    // 转向次数（简化计算：根据起点方向和目标位置）
    let currentDir = startPos.direction;
    let dx = targetPos.x - startPos.x;
    let dy = targetPos.y - startPos.y;
    
    // 第一个转向
    if (dx !== 0) {
      const targetDir = dx > 0 ? 1 : 3; // Right or Left
      if (currentDir !== targetDir) {
        steps += 1; // 一次转向
        currentDir = targetDir;
      }
    }
    
    // 第二个转向（如果需要）
    if (dy !== 0) {
      const targetDir = dy > 0 ? 2 : 0; // Down or Up
      if (currentDir !== targetDir) {
        steps += 1;
      }
    }
    
    // 攻击敌人
    steps += enemies.length;
    
    return steps;
  };

  return {
    id: levelId,
    title,
    description,
    gridSize,
    startPos,
    targetPos,
    walls,
    enemies,
    availableBlocks: blocks,
    optimalSteps: calculateOptimalSteps()
  };
};
