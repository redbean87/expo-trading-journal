import React from 'react';

import { useImageUpload } from '../hooks/use-image-upload';
import { useUpdateTrade } from '../hooks/use-trades';
import { calculatePnl } from '../schemas/trade';
import { TradeFormContent } from '../screens/add-trade/trade-form-content';
import { PendingImage, Trade, TradeFormData } from '../types';

type TradeEditFormProps = {
  trade: Trade;
  tradeId: string;
  onComplete: () => void;
};

export function TradeEditForm({
  trade,
  tradeId,
  onComplete,
}: TradeEditFormProps) {
  const updateTrade = useUpdateTrade();
  const { uploadImages } = useImageUpload();

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

    const riskAmount =
      formData.riskAmount && formData.riskAmount !== ''
        ? parseFloat(formData.riskAmount)
        : undefined;

    await updateTrade(tradeId, {
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
      pnl,
      pnlPercent,
    });

    if (pendingImages.length > 0) {
      await uploadImages(tradeId, pendingImages);
    }

    onComplete();
  };

  const initialData: TradeFormData = {
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
  };

  return (
    <TradeFormContent
      initialData={initialData}
      isEditMode
      tradeId={tradeId}
      onSubmit={handleSubmit}
      onCancel={onComplete}
    />
  );
}
