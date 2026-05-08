import Decimal from 'decimal.js';
import { z } from 'zod';

export const tradeSideSchema = z.enum(['long', 'short']);

export const tradeSchema = z.object({
  id: z.string().uuid(),
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .toUpperCase(),
  entryPrice: z.number().positive('Entry price must be positive'),
  exitPrice: z.number().positive('Exit price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  entryTime: z.coerce.date(),
  exitTime: z.coerce.date(),
  side: tradeSideSchema,
  fees: z.number().min(0).optional(),
  commissions: z.number().min(0).optional(),
  riskAmount: z.number().positive().optional(),
  strategy: z.string().max(50).optional(),
  marketCondition: z.string().max(50).optional(),
  htfContext: z.string().max(50).optional(),
  confidence: z.number().min(1).max(5).optional(),
  setupQuality: z.number().min(1).max(5).optional(),
  ruleViolation: z.string().max(200).optional(),
  whatWorked: z.string().max(500).optional(),
  whatFailed: z.string().max(500).optional(),
  psychology: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  pnl: z.number(),
  pnlPercent: z.number(),
  importedFrom: z.enum(['cash-balance', 'trade-history']).optional(),
  importId: z.string().optional(),
  orderType: z.string().optional(),
  accountBalanceAfter: z.number().optional(),
});

export const tradeFormSchema = z
  .object({
    symbol: z
      .string()
      .min(1, 'Symbol is required')
      .max(10, 'Symbol must be 10 characters or less'),
    entryPrice: z
      .string()
      .min(1, 'Entry price is required')
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Entry price must be a positive number',
      }),
    exitPrice: z
      .string()
      .min(1, 'Exit price is required')
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Exit price must be a positive number',
      }),
    quantity: z
      .string()
      .min(1, 'Quantity is required')
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Quantity must be a positive number',
      }),
    entryTime: z.coerce.date(),
    exitTime: z.coerce.date(),
    side: tradeSideSchema,
    fees: z
      .string()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        { message: 'Fees must be a non-negative number' }
      )
      .optional(),
    commissions: z
      .string()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        { message: 'Commissions must be a non-negative number' }
      )
      .optional(),
    riskAmount: z
      .string()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
        { message: 'Risk amount must be a positive number' }
      )
      .optional(),
    strategy: z
      .string()
      .max(50, 'Strategy must be 50 characters or less')
      .optional(),
    marketCondition: z
      .string()
      .max(50, 'Market condition must be 50 characters or less')
      .optional(),
    htfContext: z
      .string()
      .max(50, 'HTF context must be 50 characters or less')
      .optional(),
    confidence: z.number().min(1).max(5).optional(),
    setupQuality: z.number().min(1).max(5).optional(),
    ruleViolation: z
      .string()
      .max(200, 'Rule violation must be 200 characters or less')
      .optional(),
    whatWorked: z
      .string()
      .max(500, 'What worked must be 500 characters or less')
      .optional(),
    whatFailed: z
      .string()
      .max(500, 'What failed must be 500 characters or less')
      .optional(),
    psychology: z
      .string()
      .max(200, 'Psychology must be 200 characters or less')
      .optional(),
    notes: z
      .string()
      .max(500, 'Notes must be 500 characters or less')
      .optional(),
  })
  .refine((data) => data.exitTime >= data.entryTime, {
    message: 'Exit time must be after entry time',
    path: ['exitTime'],
  });

export const storedTradeSchema = tradeSchema.extend({
  entryTime: z.coerce.date(),
  exitTime: z.coerce.date(),
});

export const storedTradesArraySchema = z.array(storedTradeSchema);

export type Trade = z.infer<typeof tradeSchema>;
export type TradeFormData = z.infer<typeof tradeFormSchema>;
export type TradeSide = z.infer<typeof tradeSideSchema>;

export function calculatePnl(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  side: TradeSide,
  fees?: number,
  commissions?: number
): { pnl: number; pnlPercent: number } {
  const entry = new Decimal(entryPrice);
  const exit = new Decimal(exitPrice);
  const qty = new Decimal(quantity);
  const feeAmount = new Decimal(fees ?? 0).plus(commissions ?? 0);

  const priceDiff = side === 'long' ? exit.minus(entry) : entry.minus(exit);

  const pnl = priceDiff
    .times(qty)
    .minus(feeAmount)
    .toDecimalPlaces(3)
    .toNumber();
  const pnlPercent = new Decimal(pnl)
    .dividedBy(entry.times(qty))
    .times(100)
    .toDecimalPlaces(3)
    .toNumber();

  return { pnl, pnlPercent };
}

export function formDataToTrade(formData: TradeFormData, id: string): Trade {
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
  const riskAmount =
    formData.riskAmount && formData.riskAmount !== ''
      ? parseFloat(formData.riskAmount)
      : undefined;
  const { pnl, pnlPercent } = calculatePnl(
    entryPrice,
    exitPrice,
    quantity,
    formData.side,
    fees,
    commissions
  );

  return {
    id,
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
    strategy: formData.strategy,
    marketCondition: formData.marketCondition,
    htfContext: formData.htfContext,
    confidence: formData.confidence,
    setupQuality: formData.setupQuality,
    ruleViolation: formData.ruleViolation,
    whatWorked: formData.whatWorked,
    whatFailed: formData.whatFailed,
    psychology: formData.psychology,
    notes: formData.notes,
    pnl,
    pnlPercent,
  };
}
