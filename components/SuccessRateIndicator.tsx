/**
 * 🎲 成功率指示器
 * 可视化显示成功率和风险等级
 */

import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { SuccessRateState } from '../types';
import { getRiskLevelDisplay, getSuccessRateFeedback } from '../utils/successRateSystem';

interface SuccessRateIndicatorProps {
  successRateState: SuccessRateState;
  showDetails?: boolean;
  compact?: boolean;
}

const SuccessRateIndicator: React.FC<SuccessRateIndicatorProps> = ({
  successRateState,
  showDetails = true,
  compact = false
}) => {
  const { overallRate, riskLevel, qualityModifier, temperatureModifier, complexityModifier } = successRateState;
  const percentage = (overallRate * 100).toFixed(1);
  const riskDisplay = getRiskLevelDisplay(riskLevel);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${riskDisplay.bgColor}`}>
        <span className="text-lg">{riskDisplay.emoji}</span>
        <span className={`font-bold ${riskDisplay.color}`}>
          {percentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-md border-2 border-slate-200">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          🎲 成功率分析
        </h4>
        <div className={`px-3 py-1 rounded-full ${riskDisplay.bgColor} flex items-center gap-1`}>
          <span>{riskDisplay.emoji}</span>
          <span className={`font-bold text-sm ${riskDisplay.color}`}>
            {riskDisplay.text}
          </span>
        </div>
      </div>

      {/* 成功率进度条 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-slate-600">综合成功率</span>
          <span className={`text-2xl font-black ${
            overallRate >= 0.9 ? 'text-green-600' :
            overallRate >= 0.7 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {percentage}%
          </span>
        </div>
        
        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              overallRate >= 0.9 ? 'bg-green-500' :
              overallRate >= 0.7 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${overallRate * 100}%` }}
          />
        </div>
        
        <p className="text-xs text-slate-500 mt-1">
          {getSuccessRateFeedback(overallRate)}
        </p>
      </div>

      {/* 详细影响因素 */}
      {showDetails && (
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase">影响因素</p>
          
          <FactorItem
            label="原料品质"
            value={qualityModifier}
            icon={qualityModifier >= 1 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          />
          
          <FactorItem
            label="温度控制"
            value={temperatureModifier}
            icon={temperatureModifier >= 1 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          />
          
          <FactorItem
            label="配方复杂度"
            value={complexityModifier}
            icon={complexityModifier >= 0.9 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          />
        </div>
      )}
    </div>
  );
};

// 影响因素单项
const FactorItem: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  const percentage = (value * 100).toFixed(0);
  const isPositive = value >= 1;
  const isNeutral = value >= 0.95 && value <= 1.05;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className={isPositive ? 'text-green-600' : 'text-orange-600'}>
          {icon}
        </span>
        <span className="text-slate-600">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {!isNeutral && (
          <span className="text-xs">
            {isPositive ? <TrendingUp size={12} className="text-green-600" /> : <TrendingDown size={12} className="text-red-600" />}
          </span>
        )}
        <span className={`font-bold ${
          isPositive ? 'text-green-600' : 'text-orange-600'
        }`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default SuccessRateIndicator;
