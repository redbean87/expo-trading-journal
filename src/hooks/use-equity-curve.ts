import { useMemo } from 'react';

import { Trade } from '../types';

export type EquityDataPoint = {
  date: Date;
  cumulativePnl: number;
  drawdown: number;
  tradeId: string;
};

export type EquityCurveData = {
  dataPoints: EquityDataPoint[];
  currentBalance: number;
  startingBalance: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakValue: number;
  // Stats
  tradingDays: number;
  bestDay: number;
  worstDay: number;
  longestRecovery: number;
  avgRecovery: number;
  totalDaysInDrawdown: number;
};

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function useEquityCurve(trades: Trade[]): EquityCurveData {
  return useMemo(() => {
    if (trades.length === 0) {
      return {
        dataPoints: [],
        currentBalance: 0,
        startingBalance: 0,
        totalReturnPercent: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        peakValue: 0,
        tradingDays: 0,
        bestDay: 0,
        worstDay: 0,
        longestRecovery: 0,
        avgRecovery: 0,
        totalDaysInDrawdown: 0,
      };
    }

    const sortedTrades = [...trades].sort(
      (a, b) => a.exitTime.getTime() - b.exitTime.getTime()
    );

    // Group trades by date
    const tradesByDate = new Map<string, Trade[]>();
    for (const trade of sortedTrades) {
      const dateKey = getDateKey(trade.exitTime);
      if (!tradesByDate.has(dateKey)) {
        tradesByDate.set(dateKey, []);
      }
      tradesByDate.get(dateKey)!.push(trade);
    }

    // Sort date keys chronologically
    const sortedDateKeys = Array.from(tradesByDate.keys()).sort();

    // Build data points using reduce to maintain immutability
    const { dataPoints, peak, maxDrawdown, finalCumulativePnl } =
      sortedDateKeys.reduce(
        (acc, dateKey) => {
          const dayTrades = tradesByDate.get(dateKey)!;
          const dayPnl = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
          const newCumulativePnl = acc.cumulativePnl + dayPnl;
          const newPeak = Math.max(acc.peak, newCumulativePnl);
          const currentDrawdown = newPeak - newCumulativePnl;
          const newMaxDrawdown = Math.max(acc.maxDrawdown, currentDrawdown);
          const lastTrade = dayTrades[dayTrades.length - 1];

          return {
            dataPoints: [
              ...acc.dataPoints,
              {
                date: lastTrade.exitTime,
                cumulativePnl: newCumulativePnl,
                drawdown: currentDrawdown,
                tradeId: lastTrade.id,
              },
            ],
            cumulativePnl: newCumulativePnl,
            peak: newPeak,
            maxDrawdown: newMaxDrawdown,
            finalCumulativePnl: newCumulativePnl,
          };
        },
        {
          dataPoints: [] as EquityDataPoint[],
          cumulativePnl: 0,
          peak: 0,
          maxDrawdown: 0,
          finalCumulativePnl: 0,
        }
      );

    // Calculate max drawdown percentage relative to the peak value
    // Use absolute value of peak to handle both positive and negative starting balances
    const maxDrawdownPercent =
      peak !== 0 ? (maxDrawdown / Math.abs(peak)) * 100 : 0;

    // Calculate starting balance (first day's cumulative PnL)
    const startingBalance = dataPoints[0]?.cumulativePnl ?? 0;

    // Calculate total return percentage
    const totalReturnPercent =
      startingBalance !== 0
        ? ((finalCumulativePnl - startingBalance) / Math.abs(startingBalance)) *
          100
        : 0;

    // Calculate stats
    const tradingDays = dataPoints.length;

    // Best and worst days (cumulative balance highs/lows)
    const bestDay = Math.max(...dataPoints.map((p) => p.cumulativePnl));
    const worstDay = Math.min(...dataPoints.map((p) => p.cumulativePnl));

    // Calculate recovery times (drawdown streaks)
    let currentStreak = 0;
    let longestRecovery = 0;
    const streaks: number[] = [];

    for (const point of dataPoints) {
      if (point.drawdown > 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
          longestRecovery = Math.max(longestRecovery, currentStreak);
        }
        currentStreak = 0;
      }
    }
    // Handle case where data ends in drawdown
    if (currentStreak > 0) {
      streaks.push(currentStreak);
      longestRecovery = Math.max(longestRecovery, currentStreak);
    }

    const avgRecovery =
      streaks.length > 0
        ? streaks.reduce((a, b) => a + b, 0) / streaks.length
        : 0;

    const totalDaysInDrawdown = streaks.reduce((a, b) => a + b, 0);

    return {
      dataPoints,
      currentBalance: finalCumulativePnl,
      startingBalance,
      totalReturnPercent,
      maxDrawdown,
      maxDrawdownPercent,
      peakValue: peak,
      tradingDays,
      bestDay,
      worstDay,
      longestRecovery,
      avgRecovery,
      totalDaysInDrawdown,
    };
  }, [trades]);
}
