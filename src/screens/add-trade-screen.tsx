import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

import { Button } from '../components/button';
import { useAppTheme } from '../hooks/use-app-theme';
import { useImageUpload } from '../hooks/use-image-upload';
import { useAddTrade, useUpdateTrade, useTrade } from '../hooks/use-trades';
import { calculatePnl } from '../schemas/trade';
import { PendingImage, Trade, TradeFormData } from '../types';
import { TradeFormContent } from './add-trade/trade-form-content';

export default function AddTradeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const addTrade = useAddTrade();
  const updateTrade = useUpdateTrade();
  const { uploadImages } = useImageUpload();
  const theme = useAppTheme();

  const isEditMode = !!params.id;
  const { trade, isLoading, notFound } = useTrade(params.id || null);

  const handleSubmit = async (
    formData: TradeFormData,
    pendingImages: PendingImage[]
  ) => {
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const quantity = parseFloat(formData.quantity);

    const fees =
      formData.fees && formData.fees !== ''
        ? parseFloat(formData.fees)
        : undefined;
    const commissions =
      formData.commissions && formData.commissions !== ''
        ? parseFloat(formData.commissions)
        : undefined;

    const { pnl, pnlPercent } = calculatePnl(
      entryPrice,
      exitPrice,
      quantity,
      formData.side,
      fees,
      commissions
    );

    let savedTradeId: string;

    const riskAmount =
      formData.riskAmount && formData.riskAmount !== ''
        ? parseFloat(formData.riskAmount)
        : undefined;

    if (isEditMode && params.id) {
      await updateTrade(params.id, {
        symbol: formData.symbol.toUpperCase(),
        entryPrice,
        exitPrice,
        quantity,
        entryTime: formData.entryTime,
        exitTime: formData.exitTime,
        side: formData.side,
        fees,
        commissions,
        riskAmount,
        strategy: formData.strategy || undefined,
        marketCondition: formData.marketCondition || undefined,
        htfContext: formData.htfContext || undefined,
        confidence: formData.confidence,
        setupQuality: formData.setupQuality,
        ruleViolation: formData.ruleViolation || undefined,
        whatWorked: formData.whatWorked || undefined,
        whatFailed: formData.whatFailed || undefined,
        psychology: formData.psychology || undefined,
        notes: formData.notes || undefined,
        structureBreakBeforeExit: formData.structureBreakBeforeExit,
        pnl,
        pnlPercent,
      });
      savedTradeId = params.id;
    } else {
      const newTrade: Omit<Trade, 'id'> = {
        symbol: formData.symbol.toUpperCase(),
        entryPrice,
        exitPrice,
        quantity,
        entryTime: formData.entryTime,
        exitTime: formData.exitTime,
        side: formData.side,
        fees,
        commissions,
        riskAmount,
        strategy: formData.strategy || undefined,
        marketCondition: formData.marketCondition || undefined,
        htfContext: formData.htfContext || undefined,
        confidence: formData.confidence,
        setupQuality: formData.setupQuality,
        ruleViolation: formData.ruleViolation || undefined,
        whatWorked: formData.whatWorked || undefined,
        whatFailed: formData.whatFailed || undefined,
        psychology: formData.psychology || undefined,
        notes: formData.notes || undefined,
        structureBreakBeforeExit: formData.structureBreakBeforeExit,
        pnl,
        pnlPercent,
      };

      const savedTrade = await addTrade(newTrade);
      savedTradeId = savedTrade.id;
    }

    if (pendingImages.length > 0) {
      await uploadImages(savedTradeId, pendingImages);
    }

    router.back();
  };

  const styles = createStyles(theme);

  if (isEditMode && isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading trade...</Text>
      </View>
    );
  }

  if (isEditMode && notFound) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="headlineSmall" style={styles.errorText}>
          Trade Not Found
        </Text>
        <Text variant="bodyMedium" style={styles.errorSubtext}>
          The trade you&apos;re trying to edit doesn&apos;t exist or has been
          deleted.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const initialData: TradeFormData =
    isEditMode && trade
      ? {
          symbol: trade.symbol,
          entryPrice: trade.entryPrice.toString(),
          exitPrice: trade.exitPrice.toString(),
          quantity: trade.quantity.toString(),
          entryTime: trade.entryTime,
          exitTime: trade.exitTime,
          side: trade.side,
          fees: trade.fees?.toString() || '',
          commissions: trade.commissions?.toString() || '',
          riskAmount: trade.riskAmount?.toString() || '',
          strategy: trade.strategy || '',
          marketCondition: trade.marketCondition || '',
          htfContext: trade.htfContext || '',
          confidence: trade.confidence,
          setupQuality: trade.setupQuality,
          ruleViolation: trade.ruleViolation || '',
          whatWorked: trade.whatWorked || '',
          whatFailed: trade.whatFailed || '',
          psychology: trade.psychology || '',
          notes: trade.notes || '',
          structureBreakBeforeExit: trade.structureBreakBeforeExit,
        }
      : {
          symbol: '',
          entryPrice: '',
          exitPrice: '',
          quantity: '',
          entryTime: new Date(),
          exitTime: new Date(),
          side: 'long',
          fees: '',
          commissions: '',
          riskAmount: '',
          strategy: '',
          marketCondition: '',
          htfContext: '',
          confidence: undefined,
          setupQuality: undefined,
          ruleViolation: '',
          whatWorked: '',
          whatFailed: '',
          psychology: '',
          notes: '',
          structureBreakBeforeExit: undefined,
        };

  return (
    <TradeFormContent
      initialData={initialData}
      isEditMode={isEditMode}
      tradeId={params.id || null}
      onSubmit={handleSubmit}
    />
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    button: {
      marginTop: 8,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    loadingText: {
      marginTop: 16,
      color: theme.colors.textSecondary,
    },
    errorText: {
      color: theme.colors.loss,
      marginBottom: 8,
    },
    errorSubtext: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
  });
