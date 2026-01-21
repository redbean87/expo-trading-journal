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
  avgTradePnl: number;
  avgTradePnlPercent: number;
  avgPerShareWin: number;
  avgPerShareLoss: number;
  largestGain: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgHoldTimeMs: number;
  winRate: number;
  profitFactor: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  longTrades: Trade[];
  shortTrades: Trade[];
  longPnl: number;
  shortPnl: number;
};

function calculateStreaks(trades: Trade[]): {
  maxWins: number;
  maxLosses: number;
} {
  if (trades.length === 0) {
    return { maxWins: 0, maxLosses: 0 };
  }

  const sorted = [...trades].sort(
    (a, b) => a.exitTime.getTime() - b.exitTime.getTime()
  );

  let maxWins = 0;
  let maxLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;

  for (const trade of sorted) {
    if (trade.pnl > 0) {
      currentWins++;
      currentLosses = 0;
      maxWins = Math.max(maxWins, currentWins);
    } else if (trade.pnl < 0) {
      currentLosses++;
      currentWins = 0;
      maxLosses = Math.max(maxLosses, currentLosses);
    } else {
      currentWins = 0;
      currentLosses = 0;
    }
  }

  return { maxWins, maxLosses };
}

export function useTradeAnalytics(trades: Trade[]): TradeAnalytics {
  return useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl < 0);
    const breakEvenTrades = trades.filter((t) => t.pnl === 0);

    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const winningPnlTotal = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const losingPnlTotal = losingTrades.reduce((sum, t) => sum + t.pnl, 0);

    const avgWin =
      winningTrades.length > 0 ? winningPnlTotal / winningTrades.length : 0;
    const avgLoss =
      losingTrades.length > 0
        ? Math.abs(losingPnlTotal / losingTrades.length)
        : 0;

    const avgTradePnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
    const avgTradePnlPercent =
      totalTrades > 0
        ? trades.reduce((sum, t) => sum + t.pnlPercent, 0) / totalTrades
        : 0;

    const winningQuantityTotal = winningTrades.reduce(
      (sum, t) => sum + t.quantity,
      0
    );
    const losingQuantityTotal = losingTrades.reduce(
      (sum, t) => sum + t.quantity,
      0
    );
    const avgPerShareWin =
      winningQuantityTotal > 0 ? winningPnlTotal / winningQuantityTotal : 0;
    const avgPerShareLoss =
      losingQuantityTotal > 0
        ? Math.abs(losingPnlTotal / losingQuantityTotal)
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

    const largestGain = bestTrade?.pnl ?? 0;
    const largestLoss = worstTrade ? Math.abs(worstTrade.pnl) : 0;

    const { maxWins: maxConsecutiveWins, maxLosses: maxConsecutiveLosses } =
      calculateStreaks(trades);

    const avgHoldTimeMs =
      totalTrades > 0
        ? trades.reduce(
            (sum, t) => sum + (t.exitTime.getTime() - t.entryTime.getTime()),
            0
          ) / totalTrades
        : 0;

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
      avgTradePnl,
      avgTradePnlPercent,
      avgPerShareWin,
      avgPerShareLoss,
      largestGain,
      largestLoss,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      avgHoldTimeMs,
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
