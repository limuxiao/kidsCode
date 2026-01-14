/**
 * 💰 经济状态面板
 * 显示金币、成本、收益统计
 */

import React from 'react';
import { Coins, TrendingUp, TrendingDown, ShoppingCart, Shield } from 'lucide-react';
import { EconomyState } from '../types';

interface EconomyPanelProps {
  economy: EconomyState;
  orderReward?: number;
  expectedProfit?: number;
  showInsurance?: boolean;
  onPurchaseInsurance?: () => void;
}

const EconomyPanel: React.FC<EconomyPanelProps> = ({
  economy,
  orderReward,
  expectedProfit,
  showInsurance = false,
  onPurchaseInsurance
}) => {
  const profit = orderReward ? orderReward - economy.currentOrderCost : 0;
  const profitMargin = orderReward ? (profit / orderReward) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-200 shadow-lg">
      {/* 当前金币 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-200">
        <div className="flex items-center gap-2">
          <Coins className="text-amber-600" size={24} />
          <span className="text-slate-600 font-medium">金币余额</span>
        </div>
        <div className="text-2xl font-black text-amber-600">
          {economy.coins}
        </div>
      </div>

      {/* 本次订单统计 */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 flex items-center gap-1">
            <ShoppingCart size={16} />
            原料成本
          </span>
          <span className="font-bold text-red-600">-{economy.currentOrderCost}</span>
        </div>

        {economy.insurancePurchased && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-1">
              <Shield size={16} />
              保险费用
            </span>
            <span className="font-bold text-blue-600">-{economy.insuranceCost}</span>
          </div>
        )}

        {orderReward && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-1">
                <TrendingUp size={16} />
                订单奖励
              </span>
              <span className="font-bold text-green-600">+{orderReward}</span>
            </div>

            <div className="pt-2 mt-2 border-t border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-bold">预期利润</span>
                <span className={`text-xl font-black ${
                  profit > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profit > 0 ? '+' : ''}{profit}
                </span>
              </div>
              <div className="text-xs text-slate-500 text-right">
                利润率 {profitMargin.toFixed(1)}%
              </div>
            </div>
          </>
        )}

        {expectedProfit !== undefined && (
          <div className="bg-white/60 rounded-lg p-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">期望收益（含风险）</span>
              <span className={`text-sm font-bold ${
                expectedProfit > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {expectedProfit > 0 ? '+' : ''}{expectedProfit.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 保险购买按钮 */}
      {showInsurance && !economy.insurancePurchased && onPurchaseInsurance && (
        <button
          onClick={onPurchaseInsurance}
          disabled={economy.coins < economy.insuranceCost}
          className="w-full mt-3 py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Shield size={16} />
          购买保险 ({economy.insuranceCost} 金币)
        </button>
      )}

      {economy.insurancePurchased && (
        <div className="mt-3 p-2 bg-blue-100 rounded-lg border border-blue-300">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Shield size={16} className="text-blue-600" />
            <span className="font-bold">✓ 已投保</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            失败时退回 50% 原料成本
          </p>
        </div>
      )}

      {/* 累计统计 */}
      <div className="mt-4 pt-3 border-t border-amber-200 grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <div className="text-slate-500">累计收益</div>
          <div className="font-bold text-green-600">+{economy.totalEarned}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-500">累计支出</div>
          <div className="font-bold text-red-600">-{economy.totalSpent}</div>
        </div>
      </div>
    </div>
  );
};

export default EconomyPanel;
