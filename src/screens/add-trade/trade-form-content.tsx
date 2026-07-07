import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { ScreenshotPicker } from './screenshot-picker';
import { TradeForm } from './trade-form';
import { Button } from '../../components/button';
import { ResponsiveContainer } from '../../components/responsive-container';
import { useAppTheme } from '../../hooks/use-app-theme';
import { calculatePnl, tradeFormSchema } from '../../schemas/trade';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<ScrollView>(null);
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
    const result = tradeFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setFieldErrors({});
    await onSubmit(formData, pendingImages);
  };

  const handleFieldUpdate = (updates: Partial<TradeFormData>) => {
    const cleared = { ...fieldErrors };
    for (const key of Object.keys(updates)) {
      delete cleared[key];
    }
    setFieldErrors(cleared);
    setFormData({ ...formData, ...updates });
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <ResponsiveContainer>
          <View style={styles.content}>
            <TradeForm
              formData={formData}
              fieldErrors={fieldErrors}
              pnl={pnl}
              pnlPercent={pnlPercent}
              onUpdate={handleFieldUpdate}
            />

            <ScreenshotPicker
              tradeId={tradeId}
              pendingImages={pendingImages}
              onPendingImagesChange={setPendingImages}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              {isEditMode ? 'Update Trade' : 'Add Trade'}
            </Button>
            {onCancel && (
              <Button mode="outlined" onPress={onCancel} style={styles.button}>
                Cancel
              </Button>
            )}
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
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
    },
    button: {
      marginTop: theme.spacing.sm,
      width: '100%',
      maxWidth: 600,
    },
  });
