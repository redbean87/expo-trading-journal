import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useThemeStore } from '../store/theme-store';
import { useTradeStore } from '../store/trade-store';

export default function HomeScreen() {
  const { trades, loadTrades } = useTradeStore();
  const { themeMode, toggleTheme } = useThemeStore();
  const theme = useAppTheme();

  useEffect(() => {
    loadTrades();
  }, []);

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const recentTrades = trades.slice(-5).reverse();

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Trading Journal
          </Text>
          <IconButton
            icon={
              themeMode === 'dark'
                ? 'white-balance-sunny'
                : 'moon-waning-crescent'
            }
            onPress={toggleTheme}
            size={24}
          />
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge">Total Trades</Text>
              <Text variant="headlineMedium" style={styles.statValue}>
                {totalTrades}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge">Total P&L</Text>
              <Text
                variant="headlineMedium"
                style={[
                  styles.statValue,
                  {
                    color:
                      totalPnl >= 0 ? theme.colors.profit : theme.colors.loss,
                  },
                ]}
              >
                ${totalPnl.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge">Win Rate</Text>
              <Text variant="headlineMedium" style={styles.statValue}>
                {winRate.toFixed(1)}%
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge">W/L Ratio</Text>
              <Text variant="headlineMedium" style={styles.statValue}>
                {winningTrades}/{losingTrades}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.recentCard}>
          <Card.Title title="Recent Trades" />
          <Card.Content>
            {recentTrades.length === 0 ? (
              <Text style={styles.emptyText}>
                No trades yet. Add your first trade!
              </Text>
            ) : (
              recentTrades.map((trade) => (
                <View key={trade.id} style={styles.tradeItem}>
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
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontWeight: 'bold',
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      marginBottom: 12,
    },
    statValue: {
      marginTop: 8,
      fontWeight: 'bold',
    },
    recentCard: {
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
