import { useMemo } from 'react';

import { Trade } from '../types';

export type StrategyMetrics = {
  name: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  profitFactor: number;
};

export type StrategyAnalytics = {
  strategies: StrategyMetrics[];
  hasData: boolean;
};

export function calculateStrategyAnalytics(trades: Trade[]): StrategyAnalytics {
  const groups = new Map<
    string,
    {
      tradeCount: number;
      winCount: number;
      totalPnl: number;
      winningPnlTotal: number;
      losingPnlTotal: number;
    }
  >();

  for (const trade of trades) {
    const key = trade.strategy ?? '(No Strategy)';
    if (!groups.has(key)) {
      groups.set(key, {
        tradeCount: 0,
        winCount: 0,
        totalPnl: 0,
        winningPnlTotal: 0,
        losingPnlTotal: 0,
      });
    }
    const group = groups.get(key)!;
    group.tradeCount += 1;
    group.totalPnl += trade.pnl;
    if (trade.pnl > 0) {
      group.winCount += 1;
      group.winningPnlTotal += trade.pnl;
    } else if (trade.pnl < 0) {
      group.losingPnlTotal += Math.abs(trade.pnl);
    }
  }

  const strategies: StrategyMetrics[] = Array.from(groups.entries()).map(
    ([name, g]) => {
      const avgWin = g.winCount > 0 ? g.winningPnlTotal / g.winCount : 0;
      const lossCount = g.tradeCount - g.winCount;
      const avgLoss = lossCount > 0 ? g.losingPnlTotal / lossCount : 0;
      const profitFactor = avgLoss > 0 ? avgWin / avgLoss : Infinity;

      return {
        name,
        tradeCount: g.tradeCount,
        winRate: (g.winCount / g.tradeCount) * 100,
        totalPnl: g.totalPnl,
        avgPnl: g.totalPnl / g.tradeCount,
        profitFactor,
      };
    }
  );

  strategies.sort((a, b) => b.totalPnl - a.totalPnl);

  return { strategies, hasData: strategies.length > 0 };
}

export function useStrategyAnalytics(trades: Trade[]): StrategyAnalytics {
  return useMemo(() => calculateStrategyAnalytics(trades), [trades]);
}
