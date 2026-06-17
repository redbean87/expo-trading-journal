import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { EmptyState } from '../../components/empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { SymbolSummaryItem } from '../../hooks/use-home-summary';

type SymbolSummaryCardProps = {
  summary: SymbolSummaryItem[];
};

function formatShares(shares: number): string {
  return `${shares.toLocaleString()} share${shares === 1 ? '' : 's'}`;
}

export function SymbolSummaryCard({ summary }: SymbolSummaryCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SectionCard title="Performance by Symbol">
      <EmptyState
        data={summary}
        fallback={
          <CardEmptyState
            icon="format-list-bulleted"
            title="No trades in this period"
            subtitle="Adjust your date range or add a trade to see performance by symbol"
          />
        }
      >
        <>
          {summary.map((item) => {
            const isProfit = item.pnl >= 0;
            return (
              <View key={item.symbol} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text variant="titleMedium" style={styles.symbol}>
                    {item.symbol}
                  </Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {formatShares(item.totalShares)}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.pnl,
                      {
                        color: isProfit
                          ? theme.colors.profit
                          : theme.colors.loss,
                      },
                    ]}
                  >
                    {isProfit ? '+' : ''}${item.pnl.toFixed(2)}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.pnlPercent,
                      {
                        color: isProfit
                          ? theme.colors.profit
                          : theme.colors.loss,
                      },
                    ]}
                  >
                    {item.pnlPercent >= 0 ? '+' : ''}
                    {item.pnlPercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      </EmptyState>
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowLeft: {
      flex: 1,
    },
    rowRight: {
      alignItems: 'flex-end',
    },
    symbol: {
      fontWeight: 'bold',
    },
    meta: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    pnl: {
      fontWeight: 'bold',
    },
    pnlPercent: {
      marginTop: theme.spacing.xs,
    },
  });
