import { useMemo } from 'react';

import { Trade } from '../types';

export type PnlBin = {
  label: string;
  count: number;
  isProfit: boolean;
};

const BINS: { label: string; min: number; max: number }[] = [
  { label: '< -500', min: -Infinity, max: -500 },
  { label: '-500/-200', min: -500, max: -200 },
  { label: '-200/-100', min: -200, max: -100 },
  { label: '-100/0', min: -100, max: 0 },
  { label: '0/+100', min: 0, max: 100 },
  { label: '+100/+200', min: 100, max: 200 },
  { label: '+200/+500', min: 200, max: 500 },
  { label: '> +500', min: 500, max: Infinity },
];

export function calculatePnlDistribution(trades: Trade[]): PnlBin[] {
  const counts = new Array(BINS.length).fill(0);

  for (const trade of trades) {
    const binIndex = BINS.findIndex(
      (bin) => trade.pnl >= bin.min && trade.pnl < bin.max
    );
    if (binIndex !== -1) {
      counts[binIndex] += 1;
    }
  }

  return BINS.map((bin, i) => ({
    label: bin.label,
    count: counts[i],
    isProfit: bin.min >= 0,
  }));
}

export function usePnlDistribution(trades: Trade[]): PnlBin[] {
  return useMemo(() => calculatePnlDistribution(trades), [trades]);
}
