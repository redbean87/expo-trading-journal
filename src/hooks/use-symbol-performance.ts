import { useMemo } from 'react';

import { Trade } from '../types';

export type SymbolSummaryItem = {
  symbol: string;
  pnl: number;
  totalShares: number;
  pnlPercent: number;
};

export function useSymbolPerformance(trades: Trade[]): SymbolSummaryItem[] {
  return useMemo(() => {
    return Array.from(
      trades
        .reduce((acc, trade) => {
          const existing = acc.get(trade.symbol) ?? {
            pnl: 0,
            totalShares: 0,
            weightedPercent: 0,
          };
          acc.set(trade.symbol, {
            pnl: existing.pnl + trade.pnl,
            totalShares: existing.totalShares + trade.quantity,
            weightedPercent:
              existing.weightedPercent + trade.pnlPercent * trade.quantity,
          });
          return acc;
        }, new Map<string, { pnl: number; totalShares: number; weightedPercent: number }>())
        .entries()
    )
      .map(([symbol, data]) => ({
        symbol,
        pnl: data.pnl,
        totalShares: data.totalShares,
        pnlPercent:
          data.totalShares > 0 ? data.weightedPercent / data.totalShares : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);
}
