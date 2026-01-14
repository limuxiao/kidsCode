/**
 * 🎮 魔法药水店游戏主组件 v2.0
 * 集成：价格系统、成功率系统、保险机制
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BlockType, 
  CodeBlock, 
  PotionLevelConfig,
  IngredientType,
  IngredientQuality,
  IngredientInfo,
  EconomyState,
  PotionState,
  SuccessRateState,
  FailureResult
} from '../types';
import { getPotionLevel } from '../utils/gameLevels';
import { 
  INGREDIENT_BASE_PRICES,
  calculateRecipeCost,
  calculateExpectedProfit,
  initEconomyState,
  purchaseIngredients,
  completeOrder,
  handleOrderFailure,
  calculateInsuranceValue
} from '../utils/economySystem';
import {
  calculateSuccessRate,
  rollSuccessCheck,
  determineFailureType,
  generateFailureResult,
  calculateExplosionRisk,
  quickCalculateSuccessRate
} from '../utils/successRateSystem';
import Block from './Block';
import PotionLab from './PotionLab';
import EconomyPanel from './EconomyPanel';
import SuccessRateIndicator from './SuccessRateIndicator';
import IngredientSelector from './IngredientSelector';
import { 
  Play, 
  RefreshCw, 
  Trophy, 
  AlertTriangle, 
  ArrowRight, 
  FlaskConical, 
  ArrowLeft, 
  ScrollText, 
  X,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface MagicShopGameProps {
  onBack: () => void;
}

const MagicShopGame: React.FC<MagicShopGameProps> = ({ onBack }) => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [level, setLevel] = useState<PotionLevelConfig | null>(null);
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'SELECTING' | 'BREWING' | 'WON' | 'LOST'>('IDLE');
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);
  const [showEconomyPanel, setShowEconomyPanel] = useState(false);
  
  // 💰 经济系统
  const [economy, setEconomy] = useState<EconomyState>(initEconomyState(100));
  
  // 🎲 原料选择
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientInfo[]>([]);
  const [showIngredientShop, setShowIngredientShop] = useState(false);
  
  // Brewing State
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isStirring, setIsStirring] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [potionState, setPotionState] = useState<PotionState>({
    ingredients: [],
    color: '',
    temperature: 50,
    magicPower: 0,
    isStirred: false,
    explosionRisk: 0
  });
  const [failureResult, setFailureResult] = useState<FailureResult | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lvl = getPotionLevel(currentLevelId);
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
    setSelectedIngredients([]);
    setShowIngredientShop(false);
    setFailureResult(null);
    
    // 初始化经济状态
    setEconomy(initEconomyState(lvl.economy.initialCoins));
    
    // 重置药水状态
    setPotionState({
      ingredients: [],
      color: '',
      temperature: 50,
      magicPower: 0,
      isStirred: false,
      explosionRisk: 0
    });
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

  // 🛒 进入原料商店
  const openIngredientShop = () => {
    if (!level) return;
    
    // 根据配方提取需要的原料类型
    const neededIngredients: IngredientType[] = [];
    level.targetRecipe.forEach(block => {
      if (block.startsWith('ADD_')) {
        const type = block.replace('ADD_', '') as IngredientType;
        neededIngredients.push(type);
      }
    });
    
    // 初始化选择（默认普通品质）
    const initialSelection: IngredientInfo[] = neededIngredients.map(type => ({
      type,
      quality: 'normal' as IngredientQuality,
      basePrice: INGREDIENT_BASE_PRICES[type].normal,
      currentPrice: INGREDIENT_BASE_PRICES[type].normal,
      successRateBonus: 1.0,
      effectBonus: 1.0
    }));
    
    setSelectedIngredients(initialSelection);
    setShowIngredientShop(true);
    setGameState('SELECTING');
  };

  // 更新原料品质选择
  const updateIngredientQuality = (index: number, quality: IngredientQuality) => {
    const updated = [...selectedIngredients];
    const ingredient = updated[index];
    
    updated[index] = {
      ...ingredient,
      quality,
      basePrice: INGREDIENT_BASE_PRICES[ingredient.type][quality],
      currentPrice: INGREDIENT_BASE_PRICES[ingredient.type][quality],
      successRateBonus: quality === 'poor' ? 0.8 : 1.0,
      effectBonus: quality === 'premium' ? 1.2 : quality === 'normal' ? 1.0 : 0.8
    };
    
    setSelectedIngredients(updated);
  };

  // 确认购买原料
  const confirmPurchase = () => {
    const totalCost = calculateRecipeCost(selectedIngredients);
    
    if (economy.coins < totalCost) {
      alert('金币不足！');
      return;
    }
    
    // 扣除金币
    setEconomy(purchaseIngredients(economy, totalCost));
    setShowIngredientShop(false);
    setGameState('IDLE');
  };

  // 购买保险
  const purchaseInsurance = () => {
    if (!level || economy.coins < level.economy.insuranceCost) return;
    
    setEconomy({
      ...economy,
      coins: economy.coins - level.economy.insuranceCost,
      insurancePurchased: true,
      insuranceCost: level.economy.insuranceCost
    });
  };

  // 🎮 执行配方
  const runCode = async () => {
    if (gameState === 'BREWING' || !level) return;
    
    // 检查是否需要先购买原料
    if (level.riskSystem.enableQualityChoice && selectedIngredients.length === 0) {
      alert('请先购买原料！');
      openIngredientShop();
      return;
    }
    
    // 重置视觉效果
    setIngredients([]);
    setIsStirring(false);
    setIsExploding(false);
    setFailureResult(null);
    setGameState('BREWING');
    setExecutingIndex(null);
    setShowRecipe(false);

    await new Promise(r => setTimeout(r, 500));

    const currentMix: IngredientType[] = [];
    let currentTemp = 50;
    let currentMagic = 0;
    let stirred = false;

    // 模拟调制过程
    for (let i = 0; i < program.length; i++) {
      setExecutingIndex(i);
      const cmd = program[i];

      if (cmd.type === 'ADD_STARDUST') {
        currentMix.push('STARDUST');
        currentMagic += 20;
      } else if (cmd.type === 'ADD_FLAME') {
        currentMix.push('FLAME');
        currentTemp += 30;
        currentMagic += 15;
      } else if (cmd.type === 'ADD_SLIME') {
        currentMix.push('SLIME');
        currentTemp -= 10;
      } else if (cmd.type === 'ADD_HERB') {
        currentMix.push('HERB');
        currentMagic += 10;
      } else if (cmd.type === 'ADD_CRYSTAL') {
        currentMix.push('CRYSTAL');
        currentTemp -= 20;
        currentMagic += 25;
      } else if (cmd.type === 'STIR') {
        setIsStirring(true);
        stirred = true;
        await new Promise(r => setTimeout(r, 1000));
        setIsStirring(false);
        currentTemp -= 5; // 搅拌降温
      }

      // 更新药水状态
      const explosionRisk = calculateExplosionRisk(
        { 
          ingredients: currentMix, 
          color: '', 
          temperature: currentTemp, 
          magicPower: currentMagic,
          isStirred: stirred,
          explosionRisk: 0
        },
        selectedIngredients.length > 0 ? selectedIngredients : []
      );
      
      setPotionState({
        ingredients: currentMix,
        color: '',
        temperature: currentTemp,
        magicPower: currentMagic,
        isStirred: stirred,
        explosionRisk
      });
      
      setIngredients(currentMix.map(String));
      
      await new Promise(r => setTimeout(r, 800));
    }

    setExecutingIndex(null);
    
    // 验证配方正确性
    let recipeCorrect = program.length === level.targetRecipe.length;
    if (recipeCorrect) {
      for (let i = 0; i < program.length; i++) {
        if (program[i].type !== level.targetRecipe[i]) {
          recipeCorrect = false;
          break;
        }
      }
    }

    if (!recipeCorrect) {
      setIsExploding(true);
      setGameState('LOST');
      setFailureResult({
        type: 'instability' as any,
        message: '配方错误！请按照正确顺序调制。',
        coinLoss: 0,
        insuranceCovered: false
      });
      return;
    }

    // 🎲 成功率判定
    if (level.riskSystem.showSuccessRate && selectedIngredients.length > 0) {
      const successRateState = calculateSuccessRate(
        selectedIngredients,
        potionState,
        level.riskSystem.baseSuccessRate
      );
      
      const success = rollSuccessCheck(successRateState.overallRate);
      
      if (success) {
        // ✅ 成功
        setEconomy(completeOrder(economy, level.economy.orderReward));
        setGameState('WON');
      } else {
        // ❌ 失败
        setIsExploding(true);
        const failType = determineFailureType(potionState);
        const failure = generateFailureResult(failType, economy, potionState);
        setFailureResult(failure);
        setEconomy(handleOrderFailure(economy));
        setGameState('LOST');
      }
    } else {
      // 无风险模式（早期关卡）
      setEconomy(completeOrder(economy, level.economy.orderReward));
      setGameState('WON');
    }
  };

  // 计算当前成功率（用于预览）
  const getCurrentSuccessRate = (): SuccessRateState | null => {
    if (!level || selectedIngredients.length === 0) return null;
    return calculateSuccessRate(selectedIngredients, potionState, level.riskSystem.baseSuccessRate);
  };

  if (!level) return <div className="text-white text-center mt-20">Loading Magic...</div>;

  const totalCost = selectedIngredients.length > 0 ? calculateRecipeCost(selectedIngredients) : 0;
  const currentSuccessRate = getCurrentSuccessRate();
  const expectedProfit = currentSuccessRate 
    ? calculateExpectedProfit(
        totalCost, 
        level.economy.orderReward, 
        currentSuccessRate.overallRate,
        economy.insurancePurchased ? economy.insuranceCost : 0,
        economy.insurancePurchased
      )
    : undefined;

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col p-4 font-sans overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 左侧：工具箱和配方区 */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full">
          {/* 头部 */}
          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl flex justify-between items-center">
             <div className="flex items-center gap-3">
               <button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-xl text-slate-300">
                  <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-black text-white flex items-center gap-2">
                 <FlaskConical className="text-purple-400" /> 关卡 {level.id}
               </h1>
             </div>
             
             {/* 金币余额按钮 */}
             <button
               onClick={() => setShowEconomyPanel(!showEconomyPanel)}
               className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg border-2 border-amber-400 transition-all"
             >
               <span className="text-2xl">💰</span>
               <div className="text-left">
                 <div className="text-xs text-amber-100 font-medium">金币余额</div>
                 <div className="text-lg font-black text-white">{economy.coins}</div>
               </div>
               <span className={`text-white transition-transform ${showEconomyPanel ? 'rotate-180' : ''}`}>▼</span>
             </button>
          </div>

          {/* 💰 经济面板下拉弹窗 */}
          {showEconomyPanel && (
            <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl animate-in slide-in-from-top duration-300">
              <EconomyPanel 
                economy={economy}
                orderReward={level.economy.orderReward}
                expectedProfit={expectedProfit}
                showInsurance={level.economy.enableInsurance && !economy.insurancePurchased}
                onPurchaseInsurance={purchaseInsurance}
              />
            </div>
          )}

          {/* 原料架 */}
          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl shrink-0">
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">原料架</h3>
               {level.riskSystem.enableQualityChoice && (
                 <button
                   onClick={openIngredientShop}
                   className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1"
                 >
                   <ShoppingBag size={14} />
                   购买原料
                 </button>
               )}
             </div>
             <div className="grid grid-cols-2 gap-2 max-h-[25vh] overflow-y-auto">
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

          {/* 配方区 */}
          <div 
             onDrop={handleDrop}
             onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
             className="flex-1 bg-slate-800/50 p-4 rounded-3xl border-4 border-dashed border-slate-700/50 flex flex-col relative overflow-hidden"
          >
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">配方区</h3>
             <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-1 p-2">
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
               <button 
                 onClick={runCode} 
                 disabled={gameState === 'BREWING'} 
                 className="w-full py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white shadow-[0_4px_0_#7e22ce] disabled:opacity-50"
               >
                 {gameState === 'BREWING' ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
                 {gameState === 'BREWING' ? '调制中...' : '开始调制'}
               </button>
             </div>
          </div>
        </div>

        {/* 右侧：实验室区域 */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-1 flex items-center justify-center bg-slate-800 rounded-[40px] border-8 border-slate-700 shadow-2xl relative overflow-hidden p-8">
             
             {/* 配方按钮 */}
             <button 
                onClick={() => setShowRecipe(true)}
                className="absolute top-6 left-6 z-20 bg-white/90 text-purple-800 hover:bg-white px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg border-2 border-purple-200"
             >
                <ScrollText size={18} /> 查看配方
             </button>

             {/* 🎲 成功率指示器 */}
             {level.riskSystem.showSuccessRate && currentSuccessRate && selectedIngredients.length > 0 && (
               <div className="absolute top-6 right-6 z-20 w-72">
                 <SuccessRateIndicator 
                   successRateState={currentSuccessRate}
                   showDetails={false}
                   compact={false}
                 />
               </div>
             )}

             {/* 药水实验室 */}
             <PotionLab 
               ingredients={ingredients} 
               isStirring={isStirring} 
               isExploding={isExploding}
               potionState={potionState}
               showStats={level.id >= 10}
             />
             
             {/* 顾客对话框 */}
             {gameState === 'IDLE' && !showRecipe && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 max-w-md bg-white text-slate-800 p-4 rounded-2xl rounded-tr-none shadow-xl border-4 border-purple-200 animate-bounce">
                    <p className="font-bold text-sm">顾客说：</p>
                    <p className="text-lg font-black text-purple-600">"{level.customerRequest}"</p>
                </div>
             )}

             {/* 配方覆盖层 */}
             {showRecipe && (
                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
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
                      
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
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

             {/* 原料商店覆盖层 */}
             {showIngredientShop && (
                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 overflow-y-auto">
                   <div className="bg-slate-50 rounded-3xl p-6 shadow-2xl w-full max-w-3xl border-4 border-purple-300 relative my-auto">
                      <button 
                        onClick={() => setShowIngredientShop(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
                      >
                        <X size={20} />
                      </button>
                      
                      <h3 className="text-2xl font-black text-purple-600 mb-4 flex items-center gap-2">
                        <ShoppingBag /> 原料商店
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6 max-h-[50vh] overflow-y-auto p-2">
                        {selectedIngredients.map((ing, idx) => (
                          <IngredientSelector
                            key={idx}
                            ingredientType={ing.type}
                            selectedQuality={ing.quality}
                            onQualityChange={(quality) => updateIngredientQuality(idx, quality)}
                            showPrices={true}
                          />
                        ))}
                      </div>

                      <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-slate-700">总成本</span>
                          <span className="text-2xl font-black text-amber-600">{totalCost} 金币</span>
                        </div>
                        
                        {level.economy.budgetLimit && (
                          <div className="mb-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                              <span>预算限制</span>
                              <span className={totalCost > level.economy.budgetLimit ? 'text-red-600 font-bold' : 'text-green-600'}>
                                {totalCost} / {level.economy.budgetLimit}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={confirmPurchase}
                          disabled={economy.coins < totalCost || (level.economy.budgetLimit && totalCost > level.economy.budgetLimit)}
                          className="w-full py-3 rounded-xl font-bold text-lg bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white"
                        >
                          确认购买
                        </button>
                      </div>
                   </div>
                </div>
             )}

             {/* 结果覆盖层 */}
             {(gameState === 'WON' || gameState === 'LOST') && (
               <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-50">
                 {gameState === 'WON' ? (
                   <>
                     <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce" />
                     <h2 className="text-4xl font-black text-white mb-2">完美的药水！</h2>
                     <p className="text-white/70 mb-2 text-xl">顾客非常满意</p>
                     <p className="text-green-400 text-2xl font-bold mb-8">+{level.economy.orderReward} 金币</p>
                   </>
                 ) : (
                   <>
                     <AlertTriangle size={80} className="text-red-500 mb-4" />
                     <h2 className="text-4xl font-black text-white mb-2">失败了！</h2>
                     {failureResult && (
                       <>
                         <p className="text-white/70 mb-2 text-xl">{failureResult.message}</p>
                         {failureResult.insuranceCovered && (
                           <p className="text-blue-400 text-lg mb-2">🛡️ 保险退回 50% 成本</p>
                         )}
                         {failureResult.coinLoss > 0 && (
                           <p className="text-red-400 text-xl font-bold mb-8">损失 {failureResult.coinLoss} 金币</p>
                         )}
                       </>
                     )}
                   </>
                 )}
                 <div className="flex gap-4">
                    {gameState === 'LOST' ? (
                      <button 
                        onClick={() => {
                          setGameState('IDLE');
                          setSelectedIngredients([]);
                        }} 
                        className="bg-white px-8 py-3 rounded-xl font-bold text-xl hover:bg-gray-100"
                      >
                        重试
                      </button>
                    ) : (
                      <button 
                        onClick={() => setCurrentLevelId(prev => prev + 1)} 
                        className="bg-yellow-400 px-8 py-3 rounded-xl font-bold text-xl hover:bg-yellow-300"
                      >
                        下一关
                      </button>
                    )}
                 </div>
               </div>
             )}
          </div>
          
          {/* 任务说明 */}
          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shrink-0 flex items-center">
             <div className="text-slate-300 font-medium text-lg">
               <span className="text-yellow-400 font-bold mr-2">任务:</span> 
               {level.description}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicShopGame;
