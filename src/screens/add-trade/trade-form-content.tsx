import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card } from 'react-native-paper';

import { PnlPreviewCard } from './pnl-preview-card';
import { ScreenshotPicker } from './screenshot-picker';
import { TradeForm } from './trade-form';
import { Button } from '../../components/button';
import { ResponsiveContainer } from '../../components/responsive-container';
import { useAppTheme } from '../../hooks/use-app-theme';
import { calculatePnl } from '../../schemas/trade';
import { PendingImage, TradeFormData } from '../../types';

type TradeFormContentProps = {
  initialData: TradeFormData;
  isEditMode: boolean;
  tradeId: string | null;
  onSubmit: (
    data: TradeFormData,
    pendingImages: PendingImage[]
  ) => Promise<void>;
  onCancel?: () => void;
};

export function TradeFormContent({
  initialData,
  isEditMode,
  tradeId,
  onSubmit,
  onCancel,
}: TradeFormContentProps) {
  const [formData, setFormData] = useState<TradeFormData>(initialData);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const theme = useAppTheme();

  const { pnl, pnlPercent } = useMemo(() => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const qty = parseFloat(formData.quantity) || 0;

    if (entry === 0 || exit === 0 || qty === 0) {
      return { pnl: 0, pnlPercent: 0 };
    }

    const fees =
      formData.fees && formData.fees !== ''
        ? parseFloat(formData.fees)
        : undefined;
    const commissions =
      formData.commissions && formData.commissions !== ''
        ? parseFloat(formData.commissions)
        : undefined;

    return calculatePnl(entry, exit, qty, formData.side, fees, commissions);
  }, [
    formData.entryPrice,
    formData.exitPrice,
    formData.quantity,
    formData.side,
    formData.fees,
    formData.commissions,
  ]);

  const handleSubmit = async () => {
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const quantity = parseFloat(formData.quantity);

    if (!formData.symbol || !entryPrice || !exitPrice || !quantity) {
      return;
    }

    await onSubmit(formData, pendingImages);
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <ResponsiveContainer>
          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <TradeForm
                  formData={formData}
                  onUpdate={(updates) =>
                    setFormData({ ...formData, ...updates })
                  }
                />

                {formData.entryPrice &&
                  formData.exitPrice &&
                  formData.quantity && (
                    <PnlPreviewCard pnl={pnl} pnlPercent={pnlPercent} />
                  )}

                <ScreenshotPicker
                  tradeId={tradeId}
                  pendingImages={pendingImages}
                  onPendingImagesChange={setPendingImages}
                />

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
                {onCancel && (
                  <Button
                    mode="outlined"
                    onPress={onCancel}
                    style={styles.button}
                  >
                    Cancel
                  </Button>
                )}
              </Card.Content>
            </Card>
          </View>
        </ResponsiveContainer>
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
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    card: {
      marginBottom: theme.spacing.lg,
      maxWidth: 600,
      width: '100%',
    },
    button: {
      marginTop: theme.spacing.sm,
    },
  });
