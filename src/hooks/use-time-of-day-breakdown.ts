import { useMemo } from 'react';

import { Trade } from '../types';

export type TimeOfDaySummary = {
  hour: number;
  hourLabel: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
};

function formatHour(hour: number): string {
  if (hour === 0) return '12AM';
  if (hour === 12) return '12PM';
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

export function calculateTimeOfDayBreakdown(
  trades: Trade[]
): TimeOfDaySummary[] {
  const hourStats = new Map<
    number,
    { pnl: number; wins: number; total: number }
  >();

  // Aggregate by hour
  for (const trade of trades) {
    const hour = trade.exitTime.getHours();
    if (!hourStats.has(hour)) {
      hourStats.set(hour, { pnl: 0, wins: 0, total: 0 });
    }
    const stats = hourStats.get(hour)!;
    stats.pnl += trade.pnl;
    stats.total += 1;
    if (trade.pnl > 0) {
      stats.wins += 1;
    }
  }

  // Convert to array sorted by hour, only including hours with trades
  return Array.from(hourStats.entries())
    .sort(([a], [b]) => a - b)
    .map(([hour, stats]) => ({
      hour,
      hourLabel: formatHour(hour),
      totalPnl: stats.pnl,
      tradeCount: stats.total,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
    }));
}

export function useTimeOfDayBreakdown(trades: Trade[]): TimeOfDaySummary[] {
  return useMemo(() => calculateTimeOfDayBreakdown(trades), [trades]);
}
