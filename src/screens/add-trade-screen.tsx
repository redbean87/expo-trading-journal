import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';

import { useAppTheme } from '../hooks/use-app-theme';
import { useAddTrade } from '../hooks/use-trades';
import { calculatePnl } from '../schemas/trade';
import { TradeFormData } from '../types';
import { PnlPreviewCard } from './add-trade/pnl-preview-card';
import { TradeForm } from './add-trade/trade-form';

export default function AddTradeScreen() {
  const router = useRouter();
  const addTrade = useAddTrade();
  const theme = useAppTheme();
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

  const { pnl, pnlPercent } = useMemo(() => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const qty = parseFloat(formData.quantity) || 0;

    if (entry === 0 || exit === 0 || qty === 0) {
      return { pnl: 0, pnlPercent: 0 };
    }

    return calculatePnl(entry, exit, qty, formData.side);
  }, [
    formData.entryPrice,
    formData.exitPrice,
    formData.quantity,
    formData.side,
  ]);

  const handleSubmit = async () => {
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const quantity = parseFloat(formData.quantity);

    if (!formData.symbol || !entryPrice || !exitPrice || !quantity) {
      return;
    }

    const { pnl, pnlPercent } = calculatePnl(
      entryPrice,
      exitPrice,
      quantity,
      formData.side
    );

    const trade = {
      id: uuidv4(),
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

    await addTrade(trade);
    router.back();
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <TradeForm
              formData={formData}
              onUpdate={(updates) => setFormData({ ...formData, ...updates })}
            />

            {formData.entryPrice && formData.exitPrice && formData.quantity && (
              <PnlPreviewCard pnl={pnl} pnlPercent={pnlPercent} />
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={
                !formData.symbol ||
                !formData.entryPrice ||
                !formData.exitPrice ||
                !formData.quantity
              }
            >
              Add Trade
            </Button>
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
    card: {
      marginBottom: 16,
    },
    button: {
      marginTop: 8,
    },
  });
