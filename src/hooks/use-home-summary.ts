import { useMemo } from 'react';

import { useSymbolPerformance } from './use-symbol-performance';
import {
  CurrentStreak,
  calculateCurrentStreak,
  calculateTradeAnalytics,
} from './use-trade-analytics';
import { Trade } from '../types';
import { DateRangePreset, getDateRangeStart } from '../utils/date-range';

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
  symbolSummary: ReturnType<typeof useSymbolPerformance>;
};

function getPeriodCutoff(period: DateRangePreset): number | null {
  if (period === 'all') return null;
  if (period === 'today') {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  return getDateRangeStart(period);
}

export function useHomeSummary(
  trades: Trade[],
  period: DateRangePreset,
  customRangeStart?: number | null,
  customRangeEnd?: number | null
): HomeSummary {
  const filteredTrades = useMemo(() => {
    let filtered = trades;

    if (period === 'custom' && customRangeStart != null) {
      filtered = trades.filter((t) => t.exitTime.getTime() >= customRangeStart);
      if (customRangeEnd != null) {
        filtered = filtered.filter(
          (t) => t.exitTime.getTime() <= customRangeEnd
        );
      }
    } else {
      const cutoff = getPeriodCutoff(period);
      if (cutoff != null) {
        filtered = trades.filter((t) => t.exitTime.getTime() >= cutoff);
      }
    }

    return filtered;
  }, [trades, period, customRangeStart, customRangeEnd]);

  const analytics = useMemo(
    () => calculateTradeAnalytics(filteredTrades),
    [filteredTrades]
  );
  const currentStreak = useMemo(
    () => calculateCurrentStreak(filteredTrades),
    [filteredTrades]
  );
  const symbolSummary = useSymbolPerformance(filteredTrades);
  const recentTrades = useMemo(() => trades.slice(0, 5), [trades]);

  return useMemo(
    () => ({
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
      symbolSummary,
    }),
    [analytics, currentStreak, recentTrades, symbolSummary]
  );
}
