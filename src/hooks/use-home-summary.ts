import { useMemo } from 'react';

import {
  CurrentStreak,
  calculateCurrentStreak,
  calculateTradeAnalytics,
} from './use-trade-analytics';
import { HomePeriod, Trade } from '../types';
import { getDateRangeStart } from '../utils/date-range';

export type HomeSummary = {
  totalTrades: number;
  totalPnl: number;
  winRate: number;
  winningCount: number;
  losingCount: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  recentTrades: Trade[];
  currentStreak: CurrentStreak;
};

function getPeriodCutoff(period: HomePeriod): number | null {
  if (period === 'all') return null;
  if (period === 'today') {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  return getDateRangeStart(period);
}

export function useHomeSummary(
  trades: Trade[],
  period: HomePeriod
): HomeSummary {
  return useMemo(() => {
    const cutoff = getPeriodCutoff(period);
    const filtered =
      cutoff === null
        ? trades
        : trades.filter((t) => t.exitTime.getTime() >= cutoff);

    const analytics = calculateTradeAnalytics(filtered);
    const currentStreak = calculateCurrentStreak(filtered);
    const recentTrades = trades.slice(0, 5);

    return {
      totalTrades: analytics.totalTrades,
      totalPnl: analytics.totalPnl,
      winRate: analytics.winRate,
      winningCount: analytics.winningTrades.length,
      losingCount: analytics.losingTrades.length,
      avgWin: analytics.avgWin,
      avgLoss: analytics.avgLoss,
      profitFactor: analytics.profitFactor,
      recentTrades,
      currentStreak,
    };
  }, [trades, period]);
}
