import { useMemo } from 'react';

import { Trade } from '../types';

export type TradeAnalytics = {
  totalTrades: number;
  winningTrades: Trade[];
  losingTrades: Trade[];
  breakEvenTrades: Trade[];
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  winRate: number;
  profitFactor: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  longTrades: Trade[];
  shortTrades: Trade[];
  longPnl: number;
  shortPnl: number;
};

export function useTradeAnalytics(trades: Trade[]): TradeAnalytics {
  return useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl < 0);
    const breakEvenTrades = trades.filter((t) => t.pnl === 0);

    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgWin =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) /
          winningTrades.length
        : 0;
    const avgLoss =
      losingTrades.length > 0
        ? Math.abs(
            losingTrades.reduce((sum, t) => sum + t.pnl, 0) /
              losingTrades.length
          )
        : 0;

    const winRate =
      totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const profitFactor =
      avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    const bestTrade =
      trades.length > 0
        ? trades.reduce((best, t) => (t.pnl > best.pnl ? t : best), trades[0])
        : null;
    const worstTrade =
      trades.length > 0
        ? trades.reduce(
            (worst, t) => (t.pnl < worst.pnl ? t : worst),
            trades[0]
          )
        : null;

    const longTrades = trades.filter((t) => t.side === 'long');
    const shortTrades = trades.filter((t) => t.side === 'short');
    const longPnl = longTrades.reduce((sum, t) => sum + t.pnl, 0);
    const shortPnl = shortTrades.reduce((sum, t) => sum + t.pnl, 0);

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      breakEvenTrades,
      totalPnl,
      avgWin,
      avgLoss,
      winRate,
      profitFactor,
      bestTrade,
      worstTrade,
      longTrades,
      shortTrades,
      longPnl,
      shortPnl,
    };
  }, [trades]);
}
