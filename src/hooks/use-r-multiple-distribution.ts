import { useMemo } from 'react';

import { Trade } from '../types';

export type RMultipleBin = {
  label: string;
  count: number;
  isProfit: boolean;
};

const BINS: { label: string; min: number; max: number; isProfit: boolean }[] = [
  { label: '< -2R', min: -Infinity, max: -2, isProfit: false },
  { label: '-2R/-1R', min: -2, max: -1, isProfit: false },
  { label: '-1R/0R', min: -1, max: 0, isProfit: false },
  { label: '0R/+1R', min: 0, max: 1, isProfit: true },
  { label: '+1R/+2R', min: 1, max: 2, isProfit: true },
  { label: '> +2R', min: 2, max: Infinity, isProfit: true },
];

export function calculateRMultipleDistribution(
  trades: Trade[]
): RMultipleBin[] {
  const counts = new Array(BINS.length).fill(0);

  for (const trade of trades) {
    if (!trade.riskAmount || trade.riskAmount <= 0) continue;
    const r = trade.pnl / trade.riskAmount;
    const binIndex = BINS.findIndex((bin) => r >= bin.min && r < bin.max);
    if (binIndex !== -1) {
      counts[binIndex] += 1;
    }
  }

  return BINS.map((bin, i) => ({
    label: bin.label,
    count: counts[i],
    isProfit: bin.isProfit,
  }));
}

export function useRMultipleDistribution(trades: Trade[]): RMultipleBin[] {
  return useMemo(() => calculateRMultipleDistribution(trades), [trades]);
}
