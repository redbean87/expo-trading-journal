import { useMemo } from 'react';

import { Trade } from '../types';

export type EquityDataPoint = {
  date: Date;
  cumulativePnl: number;
  tradeId: string;
};

export type EquityCurveData = {
  dataPoints: EquityDataPoint[];
  currentBalance: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakValue: number;
};

export function useEquityCurve(trades: Trade[]): EquityCurveData {
  return useMemo(() => {
    if (trades.length === 0) {
      return {
        dataPoints: [],
        currentBalance: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        peakValue: 0,
      };
    }

    const sortedTrades = [...trades].sort(
      (a, b) => a.exitTime.getTime() - b.exitTime.getTime()
    );

    let cumulativePnl = 0;
    let peak = 0;
    let maxDrawdown = 0;

    const dataPoints: EquityDataPoint[] = sortedTrades.map((trade) => {
      cumulativePnl += trade.pnl;

      if (cumulativePnl > peak) {
        peak = cumulativePnl;
      }

      const currentDrawdown = peak - cumulativePnl;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }

      return {
        date: trade.exitTime,
        cumulativePnl,
        tradeId: trade.id,
      };
    });

    const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

    return {
      dataPoints,
      currentBalance: cumulativePnl,
      maxDrawdown,
      maxDrawdownPercent,
      peakValue: peak,
    };
  }, [trades]);
}
