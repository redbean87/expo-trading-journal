import { useMemo } from 'react';

import { Trade } from '../types';

export type HoldTimeBin = {
  label: string;
  count: number;
  avgPnl: number;
};

const BINS: { label: string; maxMs: number }[] = [
  { label: '<1m', maxMs: 60_000 },
  { label: '1–5m', maxMs: 5 * 60_000 },
  { label: '5–15m', maxMs: 15 * 60_000 },
  { label: '15–30m', maxMs: 30 * 60_000 },
  { label: '30m–1h', maxMs: 60 * 60_000 },
  { label: '1–4h', maxMs: 4 * 60 * 60_000 },
  { label: '4h+', maxMs: Infinity },
];

export function calculateHoldTimeHistogram(trades: Trade[]): HoldTimeBin[] {
  const buckets = BINS.map(() => ({ count: 0, pnlSum: 0 }));

  for (const trade of trades) {
    const holdMs = trade.exitTime.getTime() - trade.entryTime.getTime();
    const binIndex = BINS.findIndex((bin) => holdMs < bin.maxMs);
    if (binIndex !== -1) {
      buckets[binIndex].count += 1;
      buckets[binIndex].pnlSum += trade.pnl;
    }
  }

  return BINS.map((bin, i) => ({
    label: bin.label,
    count: buckets[i].count,
    avgPnl: buckets[i].count > 0 ? buckets[i].pnlSum / buckets[i].count : 0,
  }));
}

export function useHoldTimeHistogram(trades: Trade[]): HoldTimeBin[] {
  return useMemo(() => calculateHoldTimeHistogram(trades), [trades]);
}
