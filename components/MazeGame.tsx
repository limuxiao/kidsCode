
import React, { useState, useEffect, useRef } from 'react';
import { generateLevel } from '../utils/levelGenerator';
import { BlockType, CodeBlock, PlayerState, LevelConfig, LevelScore } from '../types';
import Block from './Block';
import MapGrid from './MapGrid';
import { Play, RefreshCw, Trophy, AlertTriangle, ArrowRight, Wand2, ArrowLeft, Home, Star, History } from 'lucide-react';
import { gameProgressDB } from '../utils/gameProgressDB';
import { calculateTotalSteps, calculateStarRating, getStarRatingText } from '../utils/scoreCalculator';

interface MazeGameProps {
  onBack: () => void;
}

const MazeGame: React.FC<MazeGameProps> = ({ onBack }) => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [level, setLevel] = useState<LevelConfig | null>(null);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [levelScores, setLevelScores] = useState<Record<number, LevelScore>>({});
  
  const [player, setPlayer] = useState<PlayerState>({ x: 0, y: 0, direction: 1 });
  const [activeEnemies, setActiveEnemies] = useState<{ x: number; y: number }[]>([]);
  const [isPlayerAlive, setIsPlayerAlive] = useState(true);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'WON' | 'LOST'>('IDLE');
  
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  
  // 历史记录功能状态
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRechallengeMode, setIsRechallengeMode] = useState(false);
  const [originalLevelId, setOriginalLevelId] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevProgramLengthRef = useRef(0);

  // 初始化时加载游戏进度
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await gameProgressDB.getProgress('maze-game');
        if (progress) {
          // 如果当前关卡已完成，则跳到下一关
          const targetLevel = progress.completedLevels.includes(progress.currentLevel)
            ? progress.currentLevel + 1
            : progress.currentLevel;
          setCurrentLevelId(targetLevel);
          setCompletedLevels(progress.completedLevels);
          setLevelScores(progress.levelScores || {});
        }
      } catch (error) {
        console.error('Failed to load game progress:', error);
      }
    };
    loadProgress();
  }, []);

  // Load level when ID changes
  useEffect(() => {
    const newLevel = generateLevel(currentLevelId);
    setLevel(newLevel);
    resetGame(newLevel);
  }, [currentLevelId]);

  // Auto-scroll to bottom when new blocks are added
  useEffect(() => {
    if (scrollContainerRef.current && program.length > prevProgramLengthRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 10);
    }
    prevProgramLengthRef.current = program.length;
  }, [program.length]);

  // 空格键快捷键：执行程序
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 空格键执行，但不在RUNNING状态且有程序时
      if (e.code === 'Space' && gameState !== 'RUNNING' && program.length > 0) {
        e.preventDefault(); // 防止页面滚动
        runCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, program.length]);

  const resetGame = (lvl: LevelConfig) => {
    setPlayer({ ...lvl.startPos });
    setActiveEnemies([...lvl.enemies]);
    setIsPlayerAlive(true);
    setGameState('IDLE');
    setProgram([]);
    setExecutingIndex(null);
  };

  // 保存游戏进度
  const saveProgress = async (levelId: number, completed: number[], scores: Record<number, LevelScore> = levelScores) => {
    try {
      await gameProgressDB.saveProgress('maze-game', levelId, completed, scores);
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  };

  // 获取所有未获得3星的已完成关卡
  const getIncompleteLevels = (): number[] => {
    return completedLevels.filter(levelId => {
      const score = levelScores[levelId];
      return !score || score.stars < 3;
    }).sort((a, b) => a - b);
  };

  // 开始重新挑战某个关卡
  const startRechallenge = (levelId: number) => {
    setOriginalLevelId(currentLevelId);
    setIsRechallengeMode(true);
    setCurrentLevelId(levelId);
    setShowHistoryModal(false);
  };

  // 返回到原始关卡
  const returnToOriginalLevel = () => {
    if (originalLevelId !== null) {
      setCurrentLevelId(originalLevelId);
    }
    setIsRechallengeMode(false);
    setOriginalLevelId(null);
  };

  // 继续挑战下一个未满星关卡
  const continueToNextIncomplete = () => {
    const incompleteLevels = getIncompleteLevels();
    const currentIndex = incompleteLevels.indexOf(currentLevelId);
    
    if (currentIndex >= 0 && currentIndex < incompleteLevels.length - 1) {
      setCurrentLevelId(incompleteLevels[currentIndex + 1]);
    } else if (incompleteLevels.length > 0) {
      setCurrentLevelId(incompleteLevels[0]);
    }
  };

  const handleDragStart = (e: React.DragEvent, block: CodeBlock) => {
    e.dataTransfer.setData('blockType', block.type);
  };

  const handleBlockClick = (type: BlockType) => {
    const newBlock: CodeBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value: (type === 'FORWARD' || type === 'BACKWARD') ? 1 : undefined
    };
    setProgram(prev => [...prev, newBlock]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('blockType') as BlockType;
    if (type) {
      const newBlock: CodeBlock = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        value: (type === 'FORWARD' || type === 'BACKWARD') ? 1 : undefined
      };
      setProgram(prev => [...prev, newBlock]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const updateBlockValue = (id: string, val: number | string) => {
    setProgram(prev => prev.map(b => b.id === id ? { ...b, value: val } : b));
  };

  const removeBlock = (id: string) => {
    setProgram(prev => prev.filter(b => b.id !== id));
  };

  const runCode = async () => {
    if (gameState === 'RUNNING' || !level) return;
    
    // Reset to start state before running
    setPlayer({ ...level.startPos });
    setActiveEnemies([...level.enemies]);
    setIsPlayerAlive(true);
    setGameState('RUNNING');
    setExecutingIndex(null);

    await new Promise(r => setTimeout(r, 500));

    let tempPlayer = { ...level.startPos };
    let tempEnemies = [...level.enemies];
    let failed = false;

    for (let i = 0; i < program.length; i++) {
      if (failed) break;
      setExecutingIndex(i);
      
      const cmd = program[i];
      const steps = Number(cmd.value) || 1;

      if (cmd.type === 'FORWARD' || cmd.type === 'BACKWARD') {
        const moveDir = cmd.type === 'FORWARD' ? 1 : -1;
        
        for (let s = 0; s < steps; s++) {
          let nextX = tempPlayer.x;
          let nextY = tempPlayer.y;

          if (tempPlayer.direction === 0) nextY -= 1 * moveDir; // Up
          if (tempPlayer.direction === 1) nextX += 1 * moveDir; // Right
          if (tempPlayer.direction === 2) nextY += 1 * moveDir; // Down
          if (tempPlayer.direction === 3) nextX -= 1 * moveDir; // Left

          if (nextX < 0 || nextX >= level.gridSize || nextY < 0 || nextY >= level.gridSize) { failed = true; break; }
          if (level.walls.some(w => w.x === nextX && w.y === nextY)) { failed = true; break; }
          
          if (tempEnemies.some(e => e.x === nextX && e.y === nextY)) { failed = true; break; }

          tempPlayer.x = nextX;
          tempPlayer.y = nextY;
          setPlayer({ ...tempPlayer });
          await new Promise(r => setTimeout(r, 500));
        }

      } else if (cmd.type === 'TURN_LEFT') {
        tempPlayer.direction = (tempPlayer.direction - 1 + 4) % 4 as any;
        setPlayer({ ...tempPlayer });
        await new Promise(r => setTimeout(r, 500));

      } else if (cmd.type === 'TURN_RIGHT') {
        tempPlayer.direction = (tempPlayer.direction + 1) % 4 as any;
        setPlayer({ ...tempPlayer });
        await new Promise(r => setTimeout(r, 500));

      } else if (cmd.type === 'ATTACK') {
        let targetX = tempPlayer.x;
        let targetY = tempPlayer.y;
        if (tempPlayer.direction === 0) targetY -= 1;
        if (tempPlayer.direction === 1) targetX += 1;
        if (tempPlayer.direction === 2) targetY += 1;
        if (tempPlayer.direction === 3) targetX -= 1;

        const enemyIdx = tempEnemies.findIndex(e => e.x === targetX && e.y === targetY);
        if (enemyIdx !== -1) {
          tempEnemies.splice(enemyIdx, 1);
          setActiveEnemies([...tempEnemies]);
        }
        await new Promise(r => setTimeout(r, 500));
      }

      if (failed) break;
    }

    setExecutingIndex(null);

    if (!failed && tempPlayer.x === level.targetPos.x && tempPlayer.y === level.targetPos.y) {
      setGameState('WON');
      
      // 计算步数和星级评分
      const totalSteps = calculateTotalSteps(program);
      const stars = calculateStarRating(totalSteps, level.optimalSteps);
      
      // 保存星级评分（只保留最高分）
      const currentScore = levelScores[currentLevelId];
      let updatedScores = levelScores;
      
      if (!currentScore || stars > currentScore.stars) {
        const newScore: LevelScore = {
          levelId: currentLevelId,
          stars,
          steps: totalSteps,
          completedAt: Date.now()
        };
        updatedScores = { ...levelScores, [currentLevelId]: newScore };
        setLevelScores(updatedScores);
      }
      
      // 记录已完成的关卡并保存所有进度（包括星级）
      let updatedCompleted = completedLevels;
      if (!completedLevels.includes(currentLevelId)) {
        updatedCompleted = [...completedLevels, currentLevelId];
        setCompletedLevels(updatedCompleted);
      }
      
      // 统一保存进度和星级到数据库
      saveProgress(currentLevelId, updatedCompleted, updatedScores);
    } else {
      setGameState('LOST');
      if (failed) setIsPlayerAlive(false);
    }
  };

  if (!level) return <div className="h-screen w-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col p-4 font-sans overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Programming) - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full">
          {/* Header */}
          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
               <button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-xl text-slate-300 hover:text-white transition-colors">
                  <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-black text-white flex items-center gap-2">
                 <Wand2 className="text-yellow-400" /> 第 {level.id} 关
                 {/* 显示该关卡的星级评分 */}
                 {levelScores[currentLevelId] && (
                   <div className="flex gap-1 ml-2">
                     {[1, 2, 3].map((star) => (
                       <Star
                         key={star}
                         size={16}
                         className={`${
                           star <= levelScores[currentLevelId].stars
                             ? 'text-yellow-400 fill-yellow-400'
                             : 'text-gray-600 fill-gray-600'
                         }`}
                       />
                     ))}
                   </div>
                 )}
                 {/* 历史记录按钮 */}
                 {completedLevels.length > 0 && (
                   <button
                     onClick={() => setShowHistoryModal(true)}
                     className="ml-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                     title="查看历史分值"
                   >
                     <History size={16} />
                   </button>
                 )}
               </h1>
             </div>
             <div className="bg-slate-900 px-3 py-1 rounded-xl text-yellow-400 font-bold border border-slate-700 text-sm">
               {program.length} 指令
             </div>
          </div>

          {/* Toolbox */}
          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl shrink-0 flex flex-col min-h-0 max-h-[30vh]">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 shrink-0">工具箱</h3>
             <div className="overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                  {level.availableBlocks.map(type => (
                    <Block 
                      key={type} 
                      data={{ id: 'temp', type, value: 1 }} 
                      isDraggable={true} 
                      onDragStart={handleDragStart}
                      onClick={() => handleBlockClick(type)}
                    />
                  ))}
                </div>
             </div>
          </div>

          {/* Workspace */}
          <div 
             onDrop={handleDrop}
             onDragOver={handleDragOver}
             className="flex-1 bg-slate-800/50 p-4 rounded-3xl border-4 border-dashed border-slate-700/50 flex flex-col min-h-0 relative overflow-hidden transition-colors hover:border-slate-500/50"
          >
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 shrink-0">程序指令区</h3>
             
             <div 
               ref={scrollContainerRef}
               className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar"
             >
               {program.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 pointer-events-none">
                   <ArrowRight size={32} className="rotate-90 mb-2" />
                   <p className="text-sm">把指令拖到这里</p>
                 </div>
               )}
               {program.map((block, idx) => (
                 <Block 
                   key={block.id} 
                   data={block} 
                   onRemove={() => removeBlock(block.id)}
                   onValueChange={(v) => updateBlockValue(block.id, v)}
                   highlight={executingIndex === idx}
                 />
               ))}
             </div>

             <div className="mt-2 pt-2 border-t border-slate-700 shrink-0">
               <button 
                 onClick={runCode}
                 disabled={gameState === 'RUNNING' || program.length === 0}
                 className={`
                   w-full py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all transform
                   ${gameState === 'RUNNING' ? 'bg-slate-600 cursor-not-allowed opacity-50' : 'bg-green-500 hover:bg-green-400 shadow-[0_4px_0_#15803d] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none'}
                   text-white
                 `}
               >
                 {gameState === 'RUNNING' ? <RefreshCw className="animate-spin" size={20} /> : <Play fill="currentColor" size={20} />}
                 {gameState === 'RUNNING' ? '执行中...' : '开始行动'}
               </button>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Game) - 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-800 rounded-[40px] border-8 border-slate-700 shadow-2xl p-4 relative overflow-hidden">
             <MapGrid 
               className="h-full w-auto max-w-full aspect-square"
               gridSize={level.gridSize} 
               player={player} 
               walls={level.walls} 
               enemies={activeEnemies} 
               target={level.targetPos}
               isPlayerAlive={isPlayerAlive}
             />

             {/* Overlays */}
             {(gameState === 'WON' || gameState === 'LOST') && (
               <div className="absolute inset-0 z-50 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in zoom-in">
                 {gameState === 'WON' ? (
                    <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce" />
                 ) : (
                    <AlertTriangle size={80} className="text-red-500 mb-4 animate-pulse" />
                 )}
                 
                 <h2 className="text-4xl font-black text-white mb-2">{gameState === 'WON' ? '挑战成功！' : '挑战失败'}</h2>
                 
                 {gameState === 'WON' && levelScores[currentLevelId] && (
                   <div className="mb-4">
                     {/* 星级显示 */}
                     <div className="flex gap-2 justify-center mb-3">
                       {[1, 2, 3].map((star) => (
                         <Star
                           key={star}
                           size={40}
                           className={`${
                             star <= levelScores[currentLevelId].stars
                               ? 'text-yellow-400 fill-yellow-400'
                               : 'text-gray-600 fill-gray-600'
                           } transition-all duration-300`}
                         />
                       ))}
                     </div>
                     
                     {/* 步数信息 */}
                     <div className="text-center space-y-1">
                       <p className="text-white font-bold text-lg">
                         {getStarRatingText(levelScores[currentLevelId].stars)}
                       </p>
                       <p className="text-slate-300 text-sm">
                         你的步数: <span className="font-bold text-blue-400">{levelScores[currentLevelId].steps}</span> 步
                       </p>
                       <p className="text-slate-300 text-sm">
                         最优步数: <span className="font-bold text-green-400">{level.optimalSteps}</span> 步
                       </p>
                     </div>
                   </div>
                 )}
                 
                 {gameState === 'LOST' && (
                   <p className="text-slate-200 mb-8">{!isPlayerAlive ? '撞到了危险！' : '未到达终点'}</p>
                 )}
                 
                 <div className="flex gap-4">
                    {gameState === 'LOST' && (
                        <button onClick={() => { resetGame(level!); setGameState('IDLE'); }} className="bg-white hover:bg-gray-100 text-slate-900 px-8 py-3 rounded-xl font-bold text-xl shadow-lg">
                          重试
                        </button>
                    )}
                    {gameState === 'WON' && !isRechallengeMode && (
                        <button onClick={() => setCurrentLevelId(prev => prev + 1)} className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-8 py-3 rounded-xl font-bold text-xl shadow-lg">
                          下一关
                        </button>
                    )}
                    {gameState === 'WON' && isRechallengeMode && (
                      <>
                        <button 
                          onClick={returnToOriginalLevel}
                          className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2"
                        >
                          <ArrowLeft size={20} />
                          返回原关卡
                        </button>
                        {getIncompleteLevels().filter(id => id !== currentLevelId).length > 0 && (
                          <button 
                            onClick={continueToNextIncomplete}
                            className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2"
                          >
                            继续挑战
                            <ArrowRight size={20} />
                          </button>
                        )}
                      </>
                    )}
                 </div>
               </div>
             )}
          </div>

          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 h-32 shrink-0 overflow-y-auto">
            <h3 className="text-yellow-400 font-bold mb-1 flex items-center gap-2 text-sm">
               任务目标
            </h3>
            <p className="text-slate-300 leading-relaxed font-medium text-sm md:text-base">
              {level.description}
            </p>
          </div>
        </div>

      </div>

      {/* 历史分值弹窗 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl border-4 border-slate-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <History className="text-yellow-400" size={28} />
                历史分值记录
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {completedLevels.length === 0 ? (
                <p className="text-slate-400 text-center py-8">暂无完成的关卡</p>
              ) : (
                completedLevels.sort((a, b) => a - b).map((levelId) => {
                  const score = levelScores[levelId];
                  const stars = score?.stars || 0;
                  const isIncomplete = stars < 3;

                  return (
                    <div
                      key={levelId}
                      className={`bg-slate-900 rounded-xl p-4 border-2 ${
                        isIncomplete
                          ? 'border-orange-500 hover:border-orange-400'
                          : 'border-slate-700'
                      } transition-all ${
                        isIncomplete ? 'cursor-pointer hover:bg-slate-800' : ''
                      }`}
                      onClick={() => isIncomplete && startRechallenge(levelId)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="text-white font-black text-lg">
                            第 {levelId} 关
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((star) => (
                              <Star
                                key={star}
                                size={20}
                                className={`${
                                  star <= stars
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-600 fill-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {score && (
                            <div className="text-slate-400 text-sm">
                              步数: <span className="text-white font-bold">{score.steps}</span>
                            </div>
                          )}
                          {isIncomplete && (
                            <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                              重新挑战
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MazeGame;
