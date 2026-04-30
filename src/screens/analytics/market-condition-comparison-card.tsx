import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { MarketConditionMetrics } from '../../hooks/use-market-condition-analytics';
import { formatCurrency } from '../../utils/format-pnl';

type MarketConditionComparisonCardProps = {
  conditions: MarketConditionMetrics[];
};

const COLUMNS = [
  { label: 'Condition', flex: 2, align: 'left' as const },
  { label: 'Trades', flex: 1, align: 'center' as const },
  { label: 'Win %', flex: 1, align: 'center' as const },
  { label: 'P&L', flex: 1.5, align: 'right' as const },
  { label: 'Avg P&L', flex: 1.5, align: 'right' as const },
];

export function MarketConditionComparisonCard({
  conditions,
}: MarketConditionComparisonCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SectionCard title="Performance by Market Condition">
      {conditions.length === 0 ? (
        <CardEmptyState
          icon="weather-windy"
          title="No market condition data yet"
          subtitle="Tag your trades with a market condition to compare performance"
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
          {conditions.map((c, index) => {
            const pnlColor =
              c.totalPnl >= 0 ? theme.colors.profit : theme.colors.loss;
            const avgColor =
              c.avgPnl >= 0 ? theme.colors.profit : theme.colors.loss;

            return (
              <View key={c.name}>
                <View style={styles.row}>
                  <Text
                    variant="bodySmall"
                    numberOfLines={1}
                    style={[styles.cell, { flex: 2 }]}
                  >
                    {c.name}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.cell, { flex: 1, textAlign: 'center' }]}
                  >
                    {c.tradeCount}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.cell, { flex: 1, textAlign: 'center' }]}
                  >
                    {c.winRate.toFixed(0)}%
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.cell,
                      { flex: 1.5, textAlign: 'right', color: pnlColor },
                    ]}
                  >
                    {formatCurrency(c.totalPnl)}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.cell,
                      { flex: 1.5, textAlign: 'right', color: avgColor },
                    ]}
                  >
                    {formatCurrency(c.avgPnl)}
                  </Text>
                </View>
                {index < conditions.length - 1 && (
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
