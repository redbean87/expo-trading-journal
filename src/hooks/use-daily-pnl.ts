import { useMemo } from 'react';

import { Trade } from '../types';
import { formatDateKey } from '../utils/calendar-helpers';

export type DailyPnl = {
  dateKey: string;
  date: Date;
  totalPnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  trades: Trade[];
};

export type DailyPnlMap = Map<string, DailyPnl>;

export type DailyPnlData = {
  dailyPnlMap: DailyPnlMap;
  maxProfit: number;
  maxLoss: number;
};

export type UseDailyPnlResult = DailyPnlData & {
  getDayData: (date: Date) => DailyPnl | undefined;
};

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function calculateDailyPnl(trades: Trade[]): DailyPnlData {
  const dailyPnlMap = new Map<string, DailyPnl>();
  let maxProfit = 0;
  let maxLoss = 0;

  for (const trade of trades) {
    const dateKey = formatDateKey(trade.exitTime);
    const existing = dailyPnlMap.get(dateKey);
    const isWin = trade.pnl > 0;
    const isLoss = trade.pnl < 0;

    if (existing) {
      existing.totalPnl += trade.pnl;
      existing.tradeCount += 1;
      existing.winCount += isWin ? 1 : 0;
      existing.lossCount += isLoss ? 1 : 0;
      existing.trades.push(trade);
    } else {
      dailyPnlMap.set(dateKey, {
        dateKey,
        date: startOfDay(trade.exitTime),
        totalPnl: trade.pnl,
        tradeCount: 1,
        winCount: isWin ? 1 : 0,
        lossCount: isLoss ? 1 : 0,
        trades: [trade],
      });
    }
  }

  // Calculate max values for color scaling
  for (const day of dailyPnlMap.values()) {
    if (day.totalPnl > maxProfit) {
      maxProfit = day.totalPnl;
    }
    if (day.totalPnl < 0 && Math.abs(day.totalPnl) > maxLoss) {
      maxLoss = Math.abs(day.totalPnl);
    }
  }

  return {
    dailyPnlMap,
    maxProfit,
    maxLoss,
  };
}

export function useDailyPnl(trades: Trade[]): UseDailyPnlResult {
  return useMemo(() => {
    const data = calculateDailyPnl(trades);

    const getDayData = (date: Date): DailyPnl | undefined => {
      return data.dailyPnlMap.get(formatDateKey(date));
    };

    return {
      ...data,
      getDayData,
    };
  }, [trades]);
}
