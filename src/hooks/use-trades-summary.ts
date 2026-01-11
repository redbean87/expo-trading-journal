import { useMemo } from 'react';

import { Trade } from '../types';

export type TradesSummary = {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: number;
  winRate: number;
  recentTrades: Trade[];
};

export function useTradesSummary(
  trades: Trade[],
  recentCount = 5
): TradesSummary {
  return useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl > 0).length;
    const losingTrades = trades.filter((t) => t.pnl < 0).length;
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const recentTrades = trades.slice(-recentCount).reverse();

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      totalPnl,
      winRate,
      recentTrades,
    };
  }, [trades, recentCount]);
}
