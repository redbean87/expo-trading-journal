import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { StrategyMetrics } from '../../hooks/use-strategy-analytics';
import { formatCurrency } from '../../utils/format-pnl';

type StrategyComparisonCardProps = {
  strategies: StrategyMetrics[];
};

const COLUMNS = [
  { label: 'Strategy', flex: 2, align: 'left' as const },
  { label: 'Trades', flex: 1, align: 'center' as const },
  { label: 'Win %', flex: 1, align: 'center' as const },
  { label: 'P&L', flex: 1.5, align: 'right' as const },
  { label: 'Avg P&L', flex: 1.5, align: 'right' as const },
];

export function StrategyComparisonCard({
  strategies,
}: StrategyComparisonCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SectionCard title="Strategy Comparison">
      {strategies.length === 0 ? (
        <CardEmptyState
          icon="chart-bar"
          title="No strategy data yet"
          subtitle="Tag your trades with a strategy to compare performance"
        />
      ) : (
        <View>
          {/* Header row */}
          <View style={styles.row}>
            {COLUMNS.map((col) => (
              <Text
                key={col.label}
                variant="labelSmall"
                style={[
                  styles.headerCell,
                  { flex: col.flex, textAlign: col.align },
                ]}
              >
                {col.label}
              </Text>
            ))}
          </View>
          <View style={styles.separator} />

          {/* Data rows */}
          {strategies.map((s, index) => {
            const pnlColor =
              s.totalPnl >= 0 ? theme.colors.profit : theme.colors.loss;
            const avgColor =
              s.avgPnl >= 0 ? theme.colors.profit : theme.colors.loss;

            return (
              <View key={s.name}>
                <View style={styles.row}>
                  <Text
                    variant="bodySmall"
                    numberOfLines={1}
                    style={[styles.cell, { flex: 2 }]}
                  >
                    {s.name}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.cell, { flex: 1, textAlign: 'center' }]}
                  >
                    {s.tradeCount}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.cell, { flex: 1, textAlign: 'center' }]}
                  >
                    {s.winRate.toFixed(0)}%
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.cell,
                      { flex: 1.5, textAlign: 'right', color: pnlColor },
                    ]}
                  >
                    {formatCurrency(s.totalPnl)}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.cell,
                      { flex: 1.5, textAlign: 'right', color: avgColor },
                    ]}
                  >
                    {formatCurrency(s.avgPnl)}
                  </Text>
                </View>
                {index < strategies.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            );
          })}
        </View>
      )}
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    headerCell: {
      color: theme.colors.textSecondary,
    },
    cell: {
      color: theme.colors.onSurface,
    },
    separator: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      marginBottom: 2,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
  });
