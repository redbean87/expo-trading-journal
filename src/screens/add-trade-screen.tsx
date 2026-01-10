import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Card,
  Text,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTradeStore } from '../store/trade-store';
import { TradeFormData } from '../types';

export default function AddTradeScreen() {
  const router = useRouter();
  const { addTrade } = useTradeStore();
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    entryTime: new Date(),
    exitTime: new Date(),
    side: 'long',
    strategy: '',
    notes: '',
  });

  const calculatePnl = () => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const qty = parseFloat(formData.quantity) || 0;

    if (formData.side === 'long') {
      return (exit - entry) * qty;
    } else {
      return (entry - exit) * qty;
    }
  };

  const calculatePnlPercent = () => {
    const entry = parseFloat(formData.entryPrice) || 0;
    if (entry === 0) return 0;

    const pnl = calculatePnl();
    const qty = parseFloat(formData.quantity) || 0;
    const totalCost = entry * qty;

    return totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  };

  const handleSubmit = () => {
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const quantity = parseFloat(formData.quantity);

    if (!formData.symbol || !entryPrice || !exitPrice || !quantity) {
      return;
    }

    const pnl = calculatePnl();
    const pnlPercent = calculatePnlPercent();

    const trade = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      entryPrice,
      exitPrice,
      quantity,
      entryTime: formData.entryTime,
      exitTime: formData.exitTime,
      side: formData.side,
      strategy: formData.strategy || undefined,
      notes: formData.notes || undefined,
      pnl,
      pnlPercent,
    };

    addTrade(trade);
    router.back();
  };

  const pnl = calculatePnl();
  const pnlPercent = calculatePnlPercent();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Symbol"
              value={formData.symbol}
              onChangeText={(text) => setFormData({ ...formData, symbol: text })}
              mode="outlined"
              style={styles.input}
              autoCapitalize="characters"
            />

            <SegmentedButtons
              value={formData.side}
              onValueChange={(value) =>
                setFormData({ ...formData, side: value as 'long' | 'short' })
              }
              buttons={[
                { value: 'long', label: 'Long' },
                { value: 'short', label: 'Short' },
              ]}
              style={styles.segmentedButtons}
            />

            <View style={styles.row}>
              <TextInput
                label="Entry Price"
                value={formData.entryPrice}
                onChangeText={(text) =>
                  setFormData({ ...formData, entryPrice: text })
                }
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Exit Price"
                value={formData.exitPrice}
                onChangeText={(text) =>
                  setFormData({ ...formData, exitPrice: text })
                }
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <TextInput
              label="Quantity"
              value={formData.quantity}
              onChangeText={(text) =>
                setFormData({ ...formData, quantity: text })
              }
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
            />

            <TextInput
              label="Strategy (Optional)"
              value={formData.strategy}
              onChangeText={(text) =>
                setFormData({ ...formData, strategy: text })
              }
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Notes (Optional)"
              value={formData.notes}
              onChangeText={(text) =>
                setFormData({ ...formData, notes: text })
              }
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            {(formData.entryPrice && formData.exitPrice && formData.quantity) && (
              <Card style={styles.pnlCard}>
                <Card.Content>
                  <Text variant="titleMedium">Projected P&L</Text>
                  <Text
                    variant="headlineMedium"
                    style={[styles.pnlText, pnl >= 0 ? styles.profit : styles.loss]}
                  >
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.pnlPercent, pnl >= 0 ? styles.profit : styles.loss]}
                  >
                    {pnlPercent >= 0 ? '+' : ''}
                    {pnlPercent.toFixed(2)}%
                  </Text>
                </Card.Content>
              </Card>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={!formData.symbol || !formData.entryPrice || !formData.exitPrice || !formData.quantity}
            >
              Add Trade
            </Button>
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
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  pnlCard: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  pnlText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  pnlPercent: {
    marginTop: 4,
  },
  profit: {
    color: '#4caf50',
  },
  loss: {
    color: '#f44336',
  },
  button: {
    marginTop: 8,
  },
});
