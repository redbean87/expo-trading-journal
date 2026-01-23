import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, SegmentedButtons, Text } from 'react-native-paper';

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

  const themedStyles = createThemedStyles(theme);

  return (
    <Card style={themedStyles.card}>
      <Card.Title title="Performance Breakdown" />
      <Card.Content>
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
          <Text style={themedStyles.emptyText}>No trades in this period</Text>
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
      </Card.Content>
    </Card>
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

const createThemedStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      marginBottom: 16,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
  });
