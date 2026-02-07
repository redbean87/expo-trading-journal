import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { SegmentedButtons } from '../../components/segmented-buttons';
import { useAppTheme } from '../../hooks/use-app-theme';
import {
  usePeriodBreakdown,
  PeriodType,
  PeriodSummary,
} from '../../hooks/use-period-breakdown';
import { Trade } from '../../types';

type PeriodBreakdownCardProps = {
  trades: Trade[];
};

function PeriodRow({
  period,
  profitColor,
  lossColor,
}: {
  period: PeriodSummary;
  profitColor: string;
  lossColor: string;
}) {
  const isProfitable = period.totalPnl >= 0;
  const pnlColor = isProfitable ? profitColor : lossColor;
  const pnlPrefix = isProfitable ? '+' : '';

  return (
    <View style={styles.periodRow}>
      <Text variant="titleSmall" style={styles.periodLabel}>
        {period.periodLabel}
      </Text>
      <View style={styles.metricsRow}>
        <Text variant="bodyMedium" style={[styles.metric, { color: pnlColor }]}>
          {pnlPrefix}${period.totalPnl.toFixed(2)}
        </Text>
        <Text variant="bodyMedium" style={styles.metric}>
          {period.tradeCount} trades
        </Text>
        <Text variant="bodyMedium" style={styles.metric}>
          {period.winRate.toFixed(0)}% WR
        </Text>
      </View>
    </View>
  );
}

export function PeriodBreakdownCard({ trades }: PeriodBreakdownCardProps) {
  const theme = useAppTheme();
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const periods = usePeriodBreakdown(trades, periodType);

  return (
    <SectionCard title="Performance Breakdown">
      <SegmentedButtons
        value={periodType}
        onValueChange={(value) => setPeriodType(value as PeriodType)}
        buttons={[
          { value: 'week', label: 'Weekly' },
          { value: 'month', label: 'Monthly' },
        ]}
        style={styles.toggle}
      />
      {periods.length === 0 ? (
        <CardEmptyState
          icon="calendar-blank-outline"
          title="No trades in this period"
          subtitle="Try a different time range or add trades"
        />
      ) : (
        <View style={styles.periodsList}>
          {periods.map((period) => (
            <PeriodRow
              key={period.periodKey}
              period={period}
              profitColor={theme.colors.profit}
              lossColor={theme.colors.loss}
            />
          ))}
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginBottom: 16,
  },
  periodsList: {
    gap: 12,
  },
  periodRow: {
    paddingVertical: 8,
  },
  periodLabel: {
    marginBottom: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    minWidth: 70,
  },
});
