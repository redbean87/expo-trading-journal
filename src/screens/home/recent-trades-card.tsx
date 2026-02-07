import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { EmptyState } from '../../components/empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { spacing } from '../../theme';
import { Trade } from '../../types';

type RecentTradesCardProps = {
  trades: Trade[];
};

export function RecentTradesCard({ trades }: RecentTradesCardProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handleTradePress = (id: string) => {
    router.push(`/trade/${id}`);
  };

  return (
    <SectionCard title="Recent Trades">
      <EmptyState
        data={trades}
        fallback={
          <CardEmptyState
            icon="chart-line-variant"
            title="No trades yet"
            subtitle="Add your first trade to get started"
          />
        }
      >
        <>
          {trades.map((trade) => (
            <Pressable
              key={trade.id}
              style={styles.tradeItem}
              onPress={() => handleTradePress(trade.id)}
            >
              <View style={styles.tradeHeader}>
                <Text variant="titleMedium">{trade.symbol}</Text>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.pnl,
                    {
                      color:
                        trade.pnl >= 0
                          ? theme.colors.profit
                          : theme.colors.loss,
                    },
                  ]}
                >
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.tradeDetails}>
                {trade.side.toUpperCase()} • {trade.quantity} shares
              </Text>
            </Pressable>
          ))}
        </>
      </EmptyState>
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    tradeItem: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tradeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    pnl: {
      fontWeight: 'bold',
    },
    tradeDetails: {
      color: theme.colors.textSecondary,
    },
  });
