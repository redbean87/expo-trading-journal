import React from 'react';

import { SectionCard } from '../../components/section-card';
import { StatRow } from '../../components/stat-row';
import { useAppTheme } from '../../hooks/use-app-theme';

type HomeEdgeMetricsProps = {
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
};

function formatProfitFactor(value: number): string {
  if (value === Infinity) return '∞';
  if (value === 0) return '—';
  return value.toFixed(2);
}

export function HomeEdgeMetrics({
  avgWin,
  avgLoss,
  profitFactor,
}: HomeEdgeMetricsProps) {
  const theme = useAppTheme();

  return (
    <SectionCard title="Edge Metrics">
      <StatRow
        label="Avg Win"
        value={`$${avgWin.toFixed(2)}`}
        valueColor={theme.colors.profit}
      />
      <StatRow
        label="Avg Loss"
        value={`$${avgLoss.toFixed(2)}`}
        valueColor={theme.colors.loss}
      />
      <StatRow label="Profit Factor" value={formatProfitFactor(profitFactor)} />
    </SectionCard>
  );
}
