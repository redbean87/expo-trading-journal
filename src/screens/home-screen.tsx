import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTradeStore } from '../store/trade-store';

export default function HomeScreen() {
  const { trades, loadTrades } = useTradeStore();

  useEffect(() => {
    loadTrades();
  }, []);

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const recentTrades = trades.slice(-5).reverse();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Trading Journal
        </Text>

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
                style={[styles.statValue, totalPnl >= 0 ? styles.profit : styles.loss]}
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
              <Text style={styles.emptyText}>No trades yet. Add your first trade!</Text>
            ) : (
              recentTrades.map((trade) => (
                <View key={trade.id} style={styles.tradeItem}>
                  <View style={styles.tradeHeader}>
                    <Text variant="titleMedium">{trade.symbol}</Text>
                    <Text
                      style={[
                        styles.pnl,
                        trade.pnl >= 0 ? styles.profit : styles.loss,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
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
  profit: {
    color: '#4caf50',
  },
  loss: {
    color: '#f44336',
  },
  recentCard: {
    marginBottom: 24,
  },
  tradeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    color: '#757575',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    paddingVertical: 24,
  },
});
