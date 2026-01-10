import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTradeStore } from '../store/trade-store';
import { Trade } from '../types';

export default function TradesScreen() {
  const { trades, loadTrades, deleteTrade } = useTradeStore();
  const router = useRouter();

  useEffect(() => {
    loadTrades();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTrade = ({ item }: { item: Trade }) => (
    <Card style={styles.tradeCard}>
      <Card.Content>
        <View style={styles.tradeHeader}>
          <View>
            <Text variant="titleLarge">{item.symbol}</Text>
            <Text variant="bodyMedium" style={styles.tradeMeta}>
              {item.side.toUpperCase()} • {item.quantity} shares
            </Text>
          </View>
          <View style={styles.tradeRight}>
            <Text
              variant="titleLarge"
              style={[styles.pnl, item.pnl >= 0 ? styles.profit : styles.loss]}
            >
              {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
            </Text>
            <Text variant="bodySmall" style={styles.pnlPercent}>
              {item.pnlPercent >= 0 ? '+' : ''}
              {item.pnlPercent.toFixed(2)}%
            </Text>
          </View>
        </View>
        <View style={styles.tradeDetails}>
          <Text variant="bodySmall">
            Entry: ${item.entryPrice.toFixed(2)} • Exit: ${item.exitPrice.toFixed(2)}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.entryTime)} - {formatDate(item.exitTime)}
          </Text>
          {item.strategy && (
            <Text variant="bodySmall" style={styles.strategy}>
              Strategy: {item.strategy}
            </Text>
          )}
        </View>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon="delete"
          iconColor="#f44336"
          onPress={() => deleteTrade(item.id)}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {trades.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyText}>
            No trades yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Tap the + button to add your first trade
          </Text>
        </View>
      ) : (
        <FlatList
          data={trades}
          renderItem={renderTrade}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-trade')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  tradeCard: {
    marginBottom: 12,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tradeMeta: {
    color: '#757575',
    marginTop: 4,
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  pnl: {
    fontWeight: 'bold',
  },
  pnlPercent: {
    color: '#757575',
    marginTop: 2,
  },
  profit: {
    color: '#4caf50',
  },
  loss: {
    color: '#f44336',
  },
  tradeDetails: {
    marginTop: 8,
    color: '#757575',
  },
  date: {
    marginTop: 4,
  },
  strategy: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginBottom: 8,
    color: '#757575',
  },
  emptySubtext: {
    color: '#9e9e9e',
    textAlign: 'center',
  },
});
