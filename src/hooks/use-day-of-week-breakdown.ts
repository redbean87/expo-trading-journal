import { useMemo } from 'react';

import { Trade } from '../types';

export type DayOfWeekSummary = {
  dayIndex: number;
  dayLabel: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Trading week order: Mon-Fri, then weekend
const TRADING_WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function calculateDayOfWeekBreakdown(
  trades: Trade[]
): DayOfWeekSummary[] {
  const dayStats = new Map<
    number,
    { pnl: number; wins: number; total: number }
  >();

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    dayStats.set(i, { pnl: 0, wins: 0, total: 0 });
  }

  // Aggregate by day of week
  for (const trade of trades) {
    const dayIndex = trade.exitTime.getDay();
    const stats = dayStats.get(dayIndex)!;
    stats.pnl += trade.pnl;
    stats.total += 1;
    if (trade.pnl > 0) {
      stats.wins += 1;
    }
  }

  // Convert to array in trading week order
  return TRADING_WEEK_ORDER.map((dayIndex) => {
    const stats = dayStats.get(dayIndex)!;
    return {
      dayIndex,
      dayLabel: DAY_LABELS[dayIndex],
      totalPnl: stats.pnl,
      tradeCount: stats.total,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
    };
  });
}

export function useDayOfWeekBreakdown(trades: Trade[]): DayOfWeekSummary[] {
  return useMemo(() => calculateDayOfWeekBreakdown(trades), [trades]);
}
