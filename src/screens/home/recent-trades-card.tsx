import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { EmptyState } from '../../components/empty-state';
import { useAppTheme } from '../../hooks/use-app-theme';
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
    <Card style={styles.card}>
      <Card.Title title="Recent Trades" />
      <Card.Content>
        <EmptyState
          data={trades}
          fallback={
            <Text style={styles.emptyText}>
              No trades yet. Add your first trade!
            </Text>
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
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      marginBottom: 24,
    },
    tradeItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tradeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    pnl: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    tradeDetails: {
      color: theme.colors.textSecondary,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      paddingVertical: 24,
    },
  });
