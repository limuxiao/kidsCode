
import React, { useState, useEffect, useRef } from 'react';
import { BlockType, CodeBlock, PotionLevelConfig } from '../types';
import { generatePotionLevel } from '../utils/gameLevels';
import Block from './Block';
import PotionLab from './PotionLab';
import { Play, RefreshCw, Trophy, AlertTriangle, ArrowRight, FlaskConical, ArrowLeft, ScrollText, X } from 'lucide-react';

interface MagicShopGameProps {
  onBack: () => void;
}

const MagicShopGame: React.FC<MagicShopGameProps> = ({ onBack }) => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [level, setLevel] = useState<PotionLevelConfig | null>(null);
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'BREWING' | 'WON' | 'LOST'>('IDLE');
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);

  // Brewing State
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isStirring, setIsStirring] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate dynamic level
    const lvl = generatePotionLevel(currentLevelId);
    setLevel(lvl);
    resetGame(lvl);
  }, [currentLevelId]);

  const resetGame = (lvl: PotionLevelConfig) => {
    setIngredients([]);
    setIsStirring(false);
    setIsExploding(false);
    setGameState('IDLE');
    setExecutingIndex(null);
    setProgram([]);
    setShowRecipe(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('blockType') as BlockType;
    if (type) {
      const newBlock: CodeBlock = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        value: undefined
      };
      setProgram(prev => [...prev, newBlock]);
    }
  };

  const runCode = async () => {
    if (gameState === 'BREWING' || !level) return;
    
    // Reset visuals before run
    setIngredients([]);
    setIsStirring(false);
    setIsExploding(false);
    setGameState('BREWING');
    setExecutingIndex(null);
    setShowRecipe(false);

    await new Promise(r => setTimeout(r, 500));

    const currentMix: string[] = [];
    let failed = false;

    // Simulate brewing process
    for (let i = 0; i < program.length; i++) {
      setExecutingIndex(i);
      const cmd = program[i];

      if (cmd.type === 'ADD_STARDUST') {
        currentMix.push('STARDUST');
      } else if (cmd.type === 'ADD_FLAME') {
        currentMix.push('FLAME');
      } else if (cmd.type === 'ADD_SLIME') {
        currentMix.push('SLIME');
      } else if (cmd.type === 'ADD_HERB') {
        currentMix.push('HERB');
      } else if (cmd.type === 'ADD_CRYSTAL') {
        currentMix.push('CRYSTAL');
      } else if (cmd.type === 'STIR') {
        setIsStirring(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsStirring(false);
      }

      setIngredients([...currentMix]);
      
      await new Promise(r => setTimeout(r, 800));
    }

    setExecutingIndex(null);
    
    // Verify Recipe
    // 1. Check length
    if (program.length !== level.targetRecipe.length) failed = true;
    else {
      // 2. Check exact sequence
      for (let i = 0; i < program.length; i++) {
        if (program[i].type !== level.targetRecipe[i]) {
          failed = true;
          break;
        }
      }
    }

    if (!failed) {
      setGameState('WON');
    } else {
      setIsExploding(true);
      setGameState('LOST');
    }
  };

  if (!level) return <div className="text-white text-center mt-20">Loading Magic...</div>;

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col p-4 font-sans overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Toolbox & Code Area */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full">
          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl flex justify-between items-center">
             <div className="flex items-center gap-3">
               <button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-xl text-slate-300">
                  <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-black text-white flex items-center gap-2">
                 <FlaskConical className="text-purple-400" /> 第 {level.id} 关
               </h1>
             </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl shrink-0 flex flex-col max-h-[30vh]">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">原料架</h3>
             <div className="overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                  {level.availableBlocks.map(type => (
                    <Block 
                      key={type} 
                      data={{ id: 'temp', type }} 
                      isDraggable={true} 
                      onDragStart={(e, d) => e.dataTransfer.setData('blockType', d.type)} 
                    />
                  ))}
                </div>
             </div>
          </div>

          <div 
             onDrop={handleDrop}
             onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
             className="flex-1 bg-slate-800/50 p-4 rounded-3xl border-4 border-dashed border-slate-700/50 flex flex-col relative overflow-hidden"
          >
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">配方区</h3>
             <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
               {program.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                   <ArrowRight size={32} className="rotate-90 mb-2" />
                   <p className="text-sm">拖入原料开始调制</p>
                 </div>
               )}
               {program.map((block, idx) => (
                 <Block 
                   key={block.id} 
                   data={block} 
                   onRemove={() => setProgram(p => p.filter(b => b.id !== block.id))}
                   highlight={executingIndex === idx}
                 />
               ))}
             </div>
             <div className="mt-2 pt-2 border-t border-slate-700">
               <button onClick={runCode} disabled={gameState === 'BREWING'} className="w-full py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white shadow-[0_4px_0_#7e22ce]">
                 {gameState === 'BREWING' ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
                 {gameState === 'BREWING' ? '调制中...' : '开始调制'}
               </button>
             </div>
          </div>
        </div>

        {/* Lab Area */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-1 flex items-center justify-center bg-slate-800 rounded-[40px] border-8 border-slate-700 shadow-2xl relative overflow-hidden p-8">
             
             {/* Recipe Button */}
             <button 
                onClick={() => setShowRecipe(true)}
                className="absolute top-6 left-6 z-20 bg-white/90 text-purple-800 hover:bg-white px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg border-2 border-purple-200 transition-transform hover:scale-105"
             >
                <ScrollText size={18} /> 查看配方
             </button>

             <PotionLab ingredients={ingredients} isStirring={isStirring} isExploding={isExploding} />
             
             {/* Customer Request Bubble */}
             {gameState === 'IDLE' && !showRecipe && (
                <div className="absolute top-8 right-8 max-w-xs bg-white text-slate-800 p-4 rounded-2xl rounded-tr-none shadow-xl border-4 border-purple-200 animate-bounce">
                    <p className="font-bold text-sm">顾客说：</p>
                    <p className="text-lg font-black text-purple-600">“{level.customerRequest}”</p>
                </div>
             )}

             {/* Recipe Overlay */}
             {showRecipe && (
                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
                   <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md border-4 border-purple-300 relative">
                      <button 
                        onClick={() => setShowRecipe(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
                      >
                        <X size={20} />
                      </button>
                      
                      <h3 className="text-2xl font-black text-purple-600 mb-4 flex items-center gap-2">
                        <ScrollText /> 秘制配方
                      </h3>
                      
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar p-2 bg-slate-50 rounded-xl border border-slate-200">
                        {level.targetRecipe.map((type, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="font-bold text-slate-400 w-6 text-right">{idx + 1}.</span>
                            <div className="flex-1">
                                <Block data={{ id: `recipe-${idx}`, type }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <p className="mt-4 text-center text-slate-500 text-sm font-medium">
                        按照这个顺序加入原料就能成功！
                      </p>
                   </div>
                </div>
             )}

             {/* Result Overlay */}
             {(gameState === 'WON' || gameState === 'LOST') && (
               <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-50">
                 {gameState === 'WON' ? <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce" /> : <AlertTriangle size={80} className="text-red-500 mb-4" />}
                 <h2 className="text-4xl font-black text-white mb-4">{gameState === 'WON' ? '完美的药水！' : '糟糕，失败了！'}</h2>
                 <p className="text-white/70 mb-8 text-xl">{gameState === 'WON' ? '顾客非常满意' : '配方似乎不太对...'}</p>
                 <div className="flex gap-4">
                    {gameState === 'LOST' ? (
                      <button onClick={() => setGameState('IDLE')} className="bg-white px-8 py-3 rounded-xl font-bold text-xl hover:bg-gray-100">重试</button>
                    ) : (
                      <button onClick={() => setCurrentLevelId(prev => prev + 1)} className="bg-yellow-400 px-8 py-3 rounded-xl font-bold text-xl hover:bg-yellow-300">下一位顾客</button>
                    )}
                 </div>
               </div>
             )}
          </div>
          
          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 h-24 shrink-0 flex items-center">
             <div className="text-slate-300 font-medium text-lg"><span className="text-yellow-400 font-bold mr-2">任务:</span> {level.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicShopGame;
