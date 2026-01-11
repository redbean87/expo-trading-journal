import Decimal from 'decimal.js';
import { z } from 'zod';

// Base schema for trade side
export const tradeSideSchema = z.enum(['long', 'short']);

// Schema for a complete trade (stored data)
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
  strategy: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  pnl: z.number(),
  pnlPercent: z.number(),
});

// Schema for form input (strings that need parsing)
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
    strategy: z
      .string()
      .max(50, 'Strategy must be 50 characters or less')
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

// Schema for parsing trades from storage (handles date strings)
export const storedTradeSchema = tradeSchema.extend({
  entryTime: z.coerce.date(),
  exitTime: z.coerce.date(),
});

export const storedTradesArraySchema = z.array(storedTradeSchema);

// Inferred types from schemas
export type Trade = z.infer<typeof tradeSchema>;
export type TradeFormData = z.infer<typeof tradeFormSchema>;
export type TradeSide = z.infer<typeof tradeSideSchema>;

// Utility function to calculate P&L with decimal precision
export function calculatePnl(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  side: TradeSide
): { pnl: number; pnlPercent: number } {
  const entry = new Decimal(entryPrice);
  const exit = new Decimal(exitPrice);
  const qty = new Decimal(quantity);

  const priceDiff = side === 'long' ? exit.minus(entry) : entry.minus(exit);

  const pnl = priceDiff.times(qty).toDecimalPlaces(3).toNumber();
  const pnlPercent = priceDiff
    .dividedBy(entry)
    .times(100)
    .toDecimalPlaces(3)
    .toNumber();

  return { pnl, pnlPercent };
}

// Transform form data to trade
export function formDataToTrade(formData: TradeFormData, id: string): Trade {
  const entryPrice = parseFloat(formData.entryPrice);
  const exitPrice = parseFloat(formData.exitPrice);
  const quantity = parseFloat(formData.quantity);
  const { pnl, pnlPercent } = calculatePnl(
    entryPrice,
    exitPrice,
    quantity,
    formData.side
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
    strategy: formData.strategy,
    notes: formData.notes,
    pnl,
    pnlPercent,
  };
}
