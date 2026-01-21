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
  realizedRR: number;
  expectedValue: number;
  requiredWinRate: number;
  longWinRate: number;
  longAvgWin: number;
  longAvgLoss: number;
  longRR: number;
  shortWinRate: number;
  shortAvgWin: number;
  shortAvgLoss: number;
  shortRR: number;
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

    // Long trade breakdown
    const winningLongTrades = longTrades.filter((t) => t.pnl > 0);
    const losingLongTrades = longTrades.filter((t) => t.pnl < 0);
    const longWinningPnlTotal = winningLongTrades.reduce(
      (sum, t) => sum + t.pnl,
      0
    );
    const longLosingPnlTotal = losingLongTrades.reduce(
      (sum, t) => sum + t.pnl,
      0
    );
    const longAvgWin =
      winningLongTrades.length > 0
        ? longWinningPnlTotal / winningLongTrades.length
        : 0;
    const longAvgLoss =
      losingLongTrades.length > 0
        ? Math.abs(longLosingPnlTotal / losingLongTrades.length)
        : 0;
    const longWinRate =
      longTrades.length > 0
        ? (winningLongTrades.length / longTrades.length) * 100
        : 0;
    const longRR =
      longAvgLoss > 0
        ? longAvgWin / longAvgLoss
        : longAvgWin > 0
          ? Infinity
          : 0;

    // Short trade breakdown
    const winningShortTrades = shortTrades.filter((t) => t.pnl > 0);
    const losingShortTrades = shortTrades.filter((t) => t.pnl < 0);
    const shortWinningPnlTotal = winningShortTrades.reduce(
      (sum, t) => sum + t.pnl,
      0
    );
    const shortLosingPnlTotal = losingShortTrades.reduce(
      (sum, t) => sum + t.pnl,
      0
    );
    const shortAvgWin =
      winningShortTrades.length > 0
        ? shortWinningPnlTotal / winningShortTrades.length
        : 0;
    const shortAvgLoss =
      losingShortTrades.length > 0
        ? Math.abs(shortLosingPnlTotal / losingShortTrades.length)
        : 0;
    const shortWinRate =
      shortTrades.length > 0
        ? (winningShortTrades.length / shortTrades.length) * 100
        : 0;
    const shortRR =
      shortAvgLoss > 0
        ? shortAvgWin / shortAvgLoss
        : shortAvgWin > 0
          ? Infinity
          : 0;

    // Overall R:R metrics
    const realizedRR =
      avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
    const lossRate =
      totalTrades > 0 ? (losingTrades.length / totalTrades) * 100 : 0;
    const expectedValue =
      totalTrades > 0
        ? (winRate / 100) * avgWin - (lossRate / 100) * avgLoss
        : 0;
    const requiredWinRate =
      realizedRR > 0 && realizedRR !== Infinity
        ? (1 / (1 + realizedRR)) * 100
        : 0;

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
      realizedRR,
      expectedValue,
      requiredWinRate,
      longWinRate,
      longAvgWin,
      longAvgLoss,
      longRR,
      shortWinRate,
      shortAvgWin,
      shortAvgLoss,
      shortRR,
    };
  }, [trades]);
}
