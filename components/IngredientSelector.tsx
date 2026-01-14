/**
 * 原料选择面板
 * 显示价格、品质等级、成功率影响
 */

import React from 'react';
import { Sparkles, Leaf, Gem, Flame, Droplets, Star, CircleDollarSign } from 'lucide-react';
import { IngredientType, IngredientQuality, IngredientInfo } from '../types';
import { INGREDIENT_BASE_PRICES } from '../utils/economySystem';

interface IngredientSelectorProps {
  ingredientType: IngredientType;
  selectedQuality: IngredientQuality;
  onQualityChange: (quality: IngredientQuality) => void;
  disabled?: boolean;
  showPrices: boolean;  // 是否显示价格（早期关卡隐藏）
}

const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  ingredientType,
  selectedQuality,
  onQualityChange,
  disabled = false,
  showPrices
}) => {
  const getIcon = () => {
    switch(ingredientType) {
      case 'STARDUST': return <Sparkles className="w-6 h-6" />;
      case 'FLAME': return <Flame className="w-6 h-6" />;
      case 'SLIME': return <Droplets className="w-6 h-6" />;
      case 'HERB': return <Leaf className="w-6 h-6" />;
      case 'CRYSTAL': return <Gem className="w-6 h-6" />;
    }
  };

  const getName = () => {
    const names: Record<IngredientType, string> = {
      STARDUST: '星尘',
      FLAME: '熔岩',
      SLIME: '粘液',
      HERB: '草药',
      CRYSTAL: '冰晶'
    };
    return names[ingredientType];
  };

  const getColorClass = () => {
    const colors: Record<IngredientType, string> = {
      STARDUST: 'text-indigo-500',
      FLAME: 'text-orange-500',
      SLIME: 'text-lime-500',
      HERB: 'text-emerald-500',
      CRYSTAL: 'text-cyan-400'
    };
    return colors[ingredientType];
  };

  const qualities: { value: IngredientQuality; label: string; stars: number }[] = [
    { value: 'poor', label: '劣质', stars: 1 },
    { value: 'normal', label: '普通', stars: 2 },
    { value: 'premium', label: '优质', stars: 3 }
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-md border-2 border-slate-200">
      {/* 原料名称和图标 */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`${getColorClass()}`}>
          {getIcon()}
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{getName()}</h4>
          {showPrices && (
            <p className="text-xs text-slate-500">选择品质等级</p>
          )}
        </div>
      </div>

      {/* 品质选择 */}
      <div className="space-y-2">
        {qualities.map(({ value, label, stars }) => {
          const price = INGREDIENT_BASE_PRICES[ingredientType][value];
          const isSelected = selectedQuality === value;
          
          return (
            <button
              key={value}
              onClick={() => onQualityChange(value)}
              disabled={disabled}
              className={`
                w-full p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* 星级 */}
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-sm text-slate-700">{label}</span>
                </div>
                
                {/* 价格 */}
                {showPrices && (
                  <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                    <CircleDollarSign size={16} />
                    {price}
                  </div>
                )}
              </div>
              
              {/* 品质说明 */}
              {isSelected && (
                <div className="mt-2 text-xs text-left">
                  {value === 'poor' && (
                    <p className="text-red-600">⚠️ 成功率 -20%，但价格便宜</p>
                  )}
                  {value === 'normal' && (
                    <p className="text-slate-600">✓ 标准成功率，性价比高</p>
                  )}
                  {value === 'premium' && (
                    <p className="text-green-600">✨ 效果更强，但价格较高</p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IngredientSelector;
