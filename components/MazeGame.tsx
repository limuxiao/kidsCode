
import React, { useState, useEffect, useRef } from 'react';
import { generateLevel } from '../utils/levelGenerator';
import { BlockType, CodeBlock, PlayerState, LevelConfig } from '../types';
import Block from './Block';
import MapGrid from './MapGrid';
import { Play, RefreshCw, Trophy, AlertTriangle, ArrowRight, Wand2, ArrowLeft, Home } from 'lucide-react';

interface MazeGameProps {
  onBack: () => void;
}

const MazeGame: React.FC<MazeGameProps> = ({ onBack }) => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [level, setLevel] = useState<LevelConfig | null>(null);
  
  const [player, setPlayer] = useState<PlayerState>({ x: 0, y: 0, direction: 1 });
  const [activeEnemies, setActiveEnemies] = useState<{ x: number; y: number }[]>([]);
  const [isPlayerAlive, setIsPlayerAlive] = useState(true);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'WON' | 'LOST'>('IDLE');
  
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevProgramLengthRef = useRef(0);

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

  const resetGame = (lvl: LevelConfig) => {
    setPlayer({ ...lvl.startPos });
    setActiveEnemies([...lvl.enemies]);
    setIsPlayerAlive(true);
    setGameState('IDLE');
    setProgram([]);
    setExecutingIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, block: CodeBlock) => {
    e.dataTransfer.setData('blockType', block.type);
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
                 <p className="text-slate-200 mb-8">{gameState === 'WON' ? '你找到了宝藏！' : (!isPlayerAlive ? '撞到了危险！' : '未到达终点')}</p>
                 
                 <div className="flex gap-4">
                    {gameState === 'LOST' && (
                        <button onClick={() => setGameState('IDLE')} className="bg-white hover:bg-gray-100 text-slate-900 px-8 py-3 rounded-xl font-bold text-xl shadow-lg">
                          重试
                        </button>
                    )}
                    {gameState === 'WON' && (
                        <button onClick={() => setCurrentLevelId(prev => prev + 1)} className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-8 py-3 rounded-xl font-bold text-xl shadow-lg">
                          下一关
                        </button>
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
    </div>
  );
};

export default MazeGame;
