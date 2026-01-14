
import React from 'react';
import { Sparkles, Leaf, Gem, Flame, Droplets } from 'lucide-react';

import { PotionState } from '../types';

interface PotionLabProps {
  ingredients: string[];
  isExploding: boolean;
  isStirring: boolean;
  potionState?: PotionState;  // 新增：药水状态
  showStats?: boolean;         // 是否显示统计信息
}

const PotionLab: React.FC<PotionLabProps> = ({ 
  ingredients, 
  isExploding, 
  isStirring, 
  potionState,
  showStats = false 
}) => {
  
  // Dynamically determine color based on composition
  const getPotionColor = () => {
    if (ingredients.length === 0) return 'from-gray-700 to-gray-800';

    const colorMap: Record<string, string> = {
      'STARDUST': 'indigo-600',
      'FLAME': 'orange-500',
      'SLIME': 'lime-500',
      'HERB': 'emerald-600',
      'CRYSTAL': 'cyan-400'
    };

    const first = ingredients[0];
    const last = ingredients[ingredients.length - 1];
    
    // Create a gradient from the first ingredient to the last ingredient
    // We map simplified names to Tailwind colors roughly
    const mapToTailwind = (key: string) => {
        if (key === 'STARDUST') return 'purple-600';
        if (key === 'FLAME') return 'red-500';
        if (key === 'SLIME') return 'lime-400';
        if (key === 'HERB') return 'emerald-500';
        if (key === 'CRYSTAL') return 'cyan-300';
        return 'gray-500';
    };

    return `from-${mapToTailwind(first)} to-${mapToTailwind(last)} shadow-[0_0_50px_rgba(255,255,255,0.3)]`;
  };

  const getIcon = (ing: string) => {
    switch(ing) {
      case 'STARDUST': return <Sparkles />;
      case 'FLAME': return <Flame />;
      case 'SLIME': return <Droplets />;
      case 'HERB': return <Leaf />;
      case 'CRYSTAL': return <Gem />;
      default: return '?';
    }
  };

  const getColorClass = (ing: string) => {
    switch(ing) {
      case 'STARDUST': return 'bg-indigo-500 ring-indigo-300 text-white';
      case 'FLAME': return 'bg-orange-500 ring-orange-300 text-white';
      case 'SLIME': return 'bg-lime-500 ring-lime-300 text-white';
      case 'HERB': return 'bg-emerald-500 ring-emerald-300 text-white';
      case 'CRYSTAL': return 'bg-cyan-400 ring-cyan-200 text-white';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-[50px] shadow-2xl aspect-square w-full max-w-[500px] mx-auto flex flex-col items-center justify-center relative border-8 border-slate-700 overflow-hidden">
      {/* Background Shelves effect */}
      <div className="absolute top-0 inset-x-0 h-24 bg-slate-900/50 flex items-end justify-around pb-2 px-8">
         <div className="w-8 h-12 bg-white/10 rounded-t-lg" />
         <div className="w-10 h-16 bg-white/10 rounded-t-lg" />
         <div className="w-8 h-10 bg-white/10 rounded-t-lg" />
      </div>

      {/* The Cauldron */}
      <div className={`relative mt-8 transition-all duration-500 ${isStirring ? 'animate-spin' : ''} ${isExploding ? 'scale-110 brightness-150 shake' : ''}`}>
        <div className="w-64 h-64 bg-slate-900 rounded-full border-b-[20px] border-black shadow-2xl relative overflow-hidden ring-4 ring-slate-600">
          {/* Liquid inside */}
          <div 
             className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 bg-gradient-to-t ${getPotionColor()}`} 
             style={{ height: ingredients.length > 0 ? '85%' : '20%' }}
          >
            <div className="absolute top-0 left-0 right-0 h-4 bg-white/10 animate-pulse" />
            {/* Bubbles */}
            {ingredients.length > 0 && [...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-4 h-4 bg-white/30 rounded-full animate-bounce"
                style={{ left: `${i * 20}%`, bottom: `${Math.random() * 80}%`, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        {/* Handles */}
        <div className="absolute top-1/2 -left-6 w-10 h-20 bg-slate-800 rounded-l-2xl border-l-4 border-slate-900 shadow-lg" />
        <div className="absolute top-1/2 -right-6 w-10 h-20 bg-slate-800 rounded-r-2xl border-r-4 border-slate-900 shadow-lg" />
      </div>

      {isExploding && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Sparkles className="text-yellow-400 animate-ping" size={200} />
          <div className="absolute inset-0 bg-white/50 animate-pulse" />
        </div>
      )}

      {/* Floating Ingredients List */}
      <div className="absolute bottom-8 flex gap-2 flex-wrap justify-center px-4">
        {ingredients.map((ing, i) => (
          <div 
            key={i} 
            className={`
              w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in slide-in-from-bottom-10 fade-in duration-500 ring-2
              ${getColorClass(ing)}
            `}
          >
            <div className="scale-75">
              {getIcon(ing)}
            </div>
          </div>
        ))}
      </div>

      {/* Potion Stats Panel */}
      {showStats && potionState && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-slate-200 min-w-[200px]">
          <h4 className="font-bold text-slate-700 text-sm mb-3 border-b pb-2">🧪 药水状态</h4>
          
          <div className="space-y-2 text-xs">
            {/* 温度 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">🌡️ 温度</span>
              <span className={`font-bold ${
                potionState.temperature > 100 ? 'text-red-600' :
                potionState.temperature < 30 ? 'text-blue-600' :
                'text-green-600'
              }`}>
                {potionState.temperature}°C
              </span>
            </div>

            {/* 魔力值 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">✨ 魔力值</span>
              <span className="font-bold text-purple-600">
                {potionState.magicPower}
              </span>
            </div>

            {/* 爆炸风险 */}
            {potionState.explosionRisk > 0.3 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">⚠️ 风险</span>
                <span className={`font-bold ${
                  potionState.explosionRisk > 0.7 ? 'text-red-600' :
                  potionState.explosionRisk > 0.5 ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  {(potionState.explosionRisk * 100).toFixed(0)}%
                </span>
              </div>
            )}

            {/* 搅拌状态 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">🌀 搅拌</span>
              <span className={`font-bold ${
                potionState.isStirred ? 'text-green-600' : 'text-slate-400'
              }`}>
                {potionState.isStirred ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotionLab;
