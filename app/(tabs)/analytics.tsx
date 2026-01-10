import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTradeStore } from '../../src/store/trade-store';

export default function AnalyticsScreen() {
  const { trades, loadTrades } = useTradeStore();

  useEffect(() => {
    loadTrades();
  }, []);

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);
  const breakEvenTrades = trades.filter((t) => t.pnl === 0);

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0;

  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

  const bestTrade = trades.length > 0
    ? trades.reduce((best, t) => (t.pnl > best.pnl ? t : best), trades[0])
    : null;
  const worstTrade = trades.length > 0
    ? trades.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst), trades[0])
    : null;

  const longTrades = trades.filter((t) => t.side === 'long');
  const shortTrades = trades.filter((t) => t.side === 'short');
  const longPnl = longTrades.reduce((sum, t) => sum + t.pnl, 0);
  const shortPnl = shortTrades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Analytics
        </Text>

        <Card style={styles.card}>
          <Card.Title title="Performance Overview" />
          <Card.Content>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Total Trades:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {totalTrades}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Win Rate:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {winRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Total P&L:</Text>
              <Text
                variant="bodyLarge"
                style={[styles.statValue, totalPnl >= 0 ? styles.profit : styles.loss]}
              >
                ${totalPnl.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Profit Factor:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Trade Statistics" />
          <Card.Content>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Winning Trades:</Text>
              <Text variant="bodyLarge" style={[styles.statValue, styles.profit]}>
                {winningTrades.length}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Losing Trades:</Text>
              <Text variant="bodyLarge" style={[styles.statValue, styles.loss]}>
                {losingTrades.length}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Break Even:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {breakEvenTrades.length}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Avg Win:</Text>
              <Text variant="bodyLarge" style={[styles.statValue, styles.profit]}>
                ${avgWin.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Avg Loss:</Text>
              <Text variant="bodyLarge" style={[styles.statValue, styles.loss]}>
                ${avgLoss.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Side Analysis" />
          <Card.Content>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Long Trades:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {longTrades.length} ({longPnl >= 0 ? '+' : ''}${longPnl.toFixed(2)})
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Short Trades:</Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {shortTrades.length} ({shortPnl >= 0 ? '+' : ''}${shortPnl.toFixed(2)})
              </Text>
            </View>
          </Card.Content>
        </Card>

        {bestTrade && (
          <Card style={styles.card}>
            <Card.Title title="Best Trade" />
            <Card.Content>
              <Text variant="titleMedium">{bestTrade.symbol}</Text>
              <Text variant="bodyMedium">{bestTrade.side.toUpperCase()}</Text>
              <Text variant="bodyLarge" style={[styles.profit, styles.marginTop]}>
                +${bestTrade.pnl.toFixed(2)} ({bestTrade.pnlPercent.toFixed(2)}%)
              </Text>
            </Card.Content>
          </Card>
        )}

        {worstTrade && (
          <Card style={styles.card}>
            <Card.Title title="Worst Trade" />
            <Card.Content>
              <Text variant="titleMedium">{worstTrade.symbol}</Text>
              <Text variant="bodyMedium">{worstTrade.side.toUpperCase()}</Text>
              <Text variant="bodyLarge" style={[styles.loss, styles.marginTop]}>
                ${worstTrade.pnl.toFixed(2)} ({worstTrade.pnlPercent.toFixed(2)}%)
              </Text>
            </Card.Content>
          </Card>
        )}
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
  card: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statValue: {
    fontWeight: 'bold',
  },
  profit: {
    color: '#4caf50',
  },
  loss: {
    color: '#f44336',
  },
  marginTop: {
    marginTop: 8,
  },
});
