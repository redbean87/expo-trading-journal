import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Card } from 'react-native-paper';

import { PnlPreviewCard } from './pnl-preview-card';
import { TradeForm } from './trade-form';
import { useAppTheme } from '../../hooks/use-app-theme';
import { calculatePnl } from '../../schemas/trade';
import { TradeFormData } from '../../types';

type TradeFormContentProps = {
  initialData: TradeFormData;
  isEditMode: boolean;
  onSubmit: (data: TradeFormData) => Promise<void>;
};

export function TradeFormContent({
  initialData,
  isEditMode,
  onSubmit,
}: TradeFormContentProps) {
  const [formData, setFormData] = useState<TradeFormData>(initialData);
  const theme = useAppTheme();

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

    await onSubmit(formData);
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <TradeForm
                formData={formData}
                onUpdate={(updates) => setFormData({ ...formData, ...updates })}
              />

              {formData.entryPrice &&
                formData.exitPrice &&
                formData.quantity && (
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
                {isEditMode ? 'Update Trade' : 'Add Trade'}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
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
