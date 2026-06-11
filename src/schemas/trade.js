'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.storedTradesArraySchema =
  exports.storedTradeSchema =
  exports.tradeFormSchema =
  exports.tradeSchema =
  exports.tradeSideSchema =
    void 0;
exports.calculatePnl = calculatePnl;
exports.formDataToTrade = formDataToTrade;
const decimal_js_1 = __importDefault(require('decimal.js'));
const zod_1 = require('zod');
exports.tradeSideSchema = zod_1.z.enum(['long', 'short']);
exports.tradeSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  symbol: zod_1.z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .toUpperCase(),
  entryPrice: zod_1.z.number().positive('Entry price must be positive'),
  exitPrice: zod_1.z.number().positive('Exit price must be positive'),
  quantity: zod_1.z.number().positive('Quantity must be positive'),
  entryTime: zod_1.z.coerce.date(),
  exitTime: zod_1.z.coerce.date(),
  side: exports.tradeSideSchema,
  fees: zod_1.z.number().min(0).optional(),
  commissions: zod_1.z.number().min(0).optional(),
  riskAmount: zod_1.z.number().positive().optional(),
  stopLoss: zod_1.z.number().positive().optional(),
  strategy: zod_1.z.string().max(50).optional(),
  marketCondition: zod_1.z.string().max(50).optional(),
  htfContext: zod_1.z.string().max(50).optional(),
  confidence: zod_1.z.number().min(1).max(5).optional(),
  setupQuality: zod_1.z.number().min(1).max(5).optional(),
  ruleViolation: zod_1.z.string().max(200).optional(),
  whatWorked: zod_1.z.string().max(500).optional(),
  whatFailed: zod_1.z.string().max(500).optional(),
  psychology: zod_1.z.string().max(200).optional(),
  notes: zod_1.z.string().max(500).optional(),
  structureBreakBeforeExit: zod_1.z.enum(['yes', 'no', 'unsure']).optional(),
  wouldTakeTradeAgain: zod_1.z.enum(['yes', 'no', 'withAdjustment']).optional(),
  pnl: zod_1.z.number(),
  pnlPercent: zod_1.z.number(),
  importedFrom: zod_1.z
    .enum(['cash-balance', 'trade-history', 'tos-merged'])
    .optional(),
  importId: zod_1.z.string().optional(),
  orderType: zod_1.z.string().optional(),
  accountBalanceAfter: zod_1.z.number().optional(),
});
exports.tradeFormSchema = zod_1.z
  .object({
    symbol: zod_1.z
      .string()
      .min(1, 'Symbol is required')
      .max(10, 'Symbol must be 10 characters or less'),
    entryPrice: zod_1.z
      .string()
      .min(1, 'Entry price is required')
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Entry price must be a positive number',
      }),
    exitPrice: zod_1.z
      .string()
      .min(1, 'Exit price is required')
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Exit price must be a positive number',
      }),
    quantity: zod_1.z
      .string()
      .min(1, 'Quantity is required')
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Quantity must be a positive number',
      }),
    entryTime: zod_1.z.coerce.date(),
    exitTime: zod_1.z.coerce.date(),
    side: exports.tradeSideSchema,
    fees: zod_1.z
      .string()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        { message: 'Fees must be a non-negative number' }
      )
      .optional(),
    commissions: zod_1.z
      .string()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        { message: 'Commissions must be a non-negative number' }
      )
      .optional(),
    riskAmount: zod_1.z
      .string()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
        { message: 'Risk amount must be a positive number' }
      )
      .optional(),
    stopLoss: zod_1.z
      .string()
      .refine(
        (val) =>
          val === '' ||
          val === undefined ||
          (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
        { message: 'Stop loss must be a positive number' }
      )
      .optional(),
    strategy: zod_1.z
      .string()
      .max(50, 'Strategy must be 50 characters or less')
      .optional(),
    marketCondition: zod_1.z
      .string()
      .max(50, 'Market condition must be 50 characters or less')
      .optional(),
    htfContext: zod_1.z
      .string()
      .max(50, 'HTF context must be 50 characters or less')
      .optional(),
    confidence: zod_1.z.number().min(1).max(5).optional(),
    setupQuality: zod_1.z.number().min(1).max(5).optional(),
    ruleViolation: zod_1.z
      .string()
      .max(200, 'Rule violation must be 200 characters or less')
      .optional(),
    whatWorked: zod_1.z
      .string()
      .max(500, 'What worked must be 500 characters or less')
      .optional(),
    whatFailed: zod_1.z
      .string()
      .max(500, 'What failed must be 500 characters or less')
      .optional(),
    psychology: zod_1.z
      .string()
      .max(200, 'Psychology must be 200 characters or less')
      .optional(),
    notes: zod_1.z
      .string()
      .max(500, 'Notes must be 500 characters or less')
      .optional(),
    structureBreakBeforeExit: zod_1.z.enum(['yes', 'no', 'unsure']).optional(),
    wouldTakeTradeAgain: zod_1.z
      .enum(['yes', 'no', 'withAdjustment'])
      .optional(),
  })
  .refine((data) => data.exitTime >= data.entryTime, {
    message: 'Exit time must be after entry time',
    path: ['exitTime'],
  });
exports.storedTradeSchema = exports.tradeSchema.extend({
  entryTime: zod_1.z.coerce.date(),
  exitTime: zod_1.z.coerce.date(),
});
exports.storedTradesArraySchema = zod_1.z.array(exports.storedTradeSchema);
function calculatePnl(
  entryPrice,
  exitPrice,
  quantity,
  side,
  fees,
  commissions
) {
  const entry = new decimal_js_1.default(entryPrice);
  const exit = new decimal_js_1.default(exitPrice);
  const qty = new decimal_js_1.default(quantity);
  const feeAmount = new decimal_js_1.default(fees ?? 0).plus(commissions ?? 0);
  const priceDiff = side === 'long' ? exit.minus(entry) : entry.minus(exit);
  const pnl = priceDiff
    .times(qty)
    .minus(feeAmount)
    .toDecimalPlaces(3)
    .toNumber();
  const pnlPercent = new decimal_js_1.default(pnl)
    .dividedBy(entry.times(qty))
    .times(100)
    .toDecimalPlaces(3)
    .toNumber();
  return { pnl, pnlPercent };
}
function formDataToTrade(formData, id) {
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
  const stopLoss =
    formData.stopLoss && formData.stopLoss !== ''
      ? parseFloat(formData.stopLoss)
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
    stopLoss,
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
    structureBreakBeforeExit: formData.structureBreakBeforeExit,
    wouldTakeTradeAgain: formData.wouldTakeTradeAgain,
    pnl,
    pnlPercent,
  };
}
