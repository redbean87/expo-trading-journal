import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { internalMutation, mutation, query } from './_generated/server';

// Query to get all trades for the authenticated user
export const getTrades = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const trades = await ctx.db
      .query('trades')
      .withIndex('by_user_and_entry_time', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();

    return trades.map((trade) => ({
      id: trade._id,
      symbol: trade.symbol,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      side: trade.side,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent,
      fees: trade.fees,
      commissions: trade.commissions,
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      setupQuality: trade.setupQuality,
      ruleViolation: trade.ruleViolation,
      importedFrom: trade.importedFrom,
      importId: trade.importId,
      orderType: trade.orderType,
      accountBalanceAfter: trade.accountBalanceAfter,
      riskAmount: trade.riskAmount,
      stopLoss: trade.stopLoss,
      marketCondition: trade.marketCondition,
      htfContext: trade.htfContext,
      structureBreakBeforeExit: trade.structureBreakBeforeExit,
      wouldTakeTradeAgain: trade.wouldTakeTradeAgain,
    }));
  },
});

// Query to get trades within a date range for the authenticated user
export const getTradesInRange = query({
  args: {
    startTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    let tradesQuery;
    if (args.startTime !== undefined) {
      tradesQuery = ctx.db
        .query('trades')
        .withIndex('by_user_and_exit_time', (q) =>
          q.eq('userId', userId).gte('exitTime', args.startTime!)
        );
    } else {
      tradesQuery = ctx.db
        .query('trades')
        .withIndex('by_user_and_exit_time', (q) => q.eq('userId', userId));
    }

    const trades = await tradesQuery.order('desc').collect();

    return trades.map((trade) => ({
      id: trade._id,
      symbol: trade.symbol,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      side: trade.side,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent,
      fees: trade.fees,
      commissions: trade.commissions,
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      setupQuality: trade.setupQuality,
      ruleViolation: trade.ruleViolation,
      importedFrom: trade.importedFrom,
      importId: trade.importId,
      orderType: trade.orderType,
      accountBalanceAfter: trade.accountBalanceAfter,
      riskAmount: trade.riskAmount,
      stopLoss: trade.stopLoss,
      marketCondition: trade.marketCondition,
      htfContext: trade.htfContext,
      structureBreakBeforeExit: trade.structureBreakBeforeExit,
    }));
  },
});

// Query to get a single trade by ID
export const getTrade = query({
  args: {
    id: v.id('trades'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const trade = await ctx.db.get(args.id);

    if (!trade) {
      return null;
    }

    // Verify the trade belongs to the user
    if (trade.userId !== userId) {
      throw new Error('Not authorized to access this trade');
    }

    return {
      id: trade._id,
      symbol: trade.symbol,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      side: trade.side,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent,
      fees: trade.fees,
      commissions: trade.commissions,
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      setupQuality: trade.setupQuality,
      ruleViolation: trade.ruleViolation,
      importedFrom: trade.importedFrom,
      importId: trade.importId,
      orderType: trade.orderType,
      accountBalanceAfter: trade.accountBalanceAfter,
      riskAmount: trade.riskAmount,
      stopLoss: trade.stopLoss,
      marketCondition: trade.marketCondition,
      htfContext: trade.htfContext,
      structureBreakBeforeExit: trade.structureBreakBeforeExit,
      wouldTakeTradeAgain: trade.wouldTakeTradeAgain,
    };
  },
});

// Mutation to add a new trade
export const addTrade = mutation({
  args: {
    symbol: v.string(),
    entryPrice: v.number(),
    exitPrice: v.number(),
    quantity: v.number(),
    entryTime: v.number(),
    exitTime: v.number(),
    side: v.string(),
    pnl: v.number(),
    pnlPercent: v.number(),
    fees: v.optional(v.number()),
    commissions: v.optional(v.number()),
    notes: v.optional(v.string()),
    strategy: v.optional(v.string()),
    psychology: v.optional(v.string()),
    whatWorked: v.optional(v.string()),
    whatFailed: v.optional(v.string()),
    confidence: v.optional(v.number()),
    setupQuality: v.optional(v.number()),
    ruleViolation: v.optional(v.string()),
    importedFrom: v.optional(v.string()),
    importId: v.optional(v.string()),
    orderType: v.optional(v.string()),
    accountBalanceAfter: v.optional(v.number()),
    riskAmount: v.optional(v.number()),
    stopLoss: v.optional(v.number()),
    marketCondition: v.optional(v.string()),
    htfContext: v.optional(v.string()),
    structureBreakBeforeExit: v.optional(v.string()),
    wouldTakeTradeAgain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const tradeId = await ctx.db.insert('trades', {
      userId,
      symbol: args.symbol,
      entryPrice: args.entryPrice,
      exitPrice: args.exitPrice,
      quantity: args.quantity,
      entryTime: args.entryTime,
      exitTime: args.exitTime,
      side: args.side,
      pnl: args.pnl,
      pnlPercent: args.pnlPercent,
      fees: args.fees,
      commissions: args.commissions,
      notes: args.notes,
      strategy: args.strategy,
      psychology: args.psychology,
      whatWorked: args.whatWorked,
      whatFailed: args.whatFailed,
      confidence: args.confidence,
      setupQuality: args.setupQuality,
      ruleViolation: args.ruleViolation,
      importId: args.importId,
      orderType: args.orderType,
      accountBalanceAfter: args.accountBalanceAfter,
      riskAmount: args.riskAmount,
      stopLoss: args.stopLoss,
      marketCondition: args.marketCondition,
      htfContext: args.htfContext,
      structureBreakBeforeExit: args.structureBreakBeforeExit,
      wouldTakeTradeAgain: args.wouldTakeTradeAgain,
    });

    return {
      id: tradeId,
      ...args,
    };
  },
});

// Mutation to update a trade
export const updateTrade = mutation({
  args: {
    id: v.id('trades'),
    symbol: v.optional(v.string()),
    entryPrice: v.optional(v.number()),
    exitPrice: v.optional(v.number()),
    quantity: v.optional(v.number()),
    entryTime: v.optional(v.number()),
    exitTime: v.optional(v.number()),
    side: v.optional(v.string()),
    pnl: v.optional(v.number()),
    pnlPercent: v.optional(v.number()),
    fees: v.optional(v.number()),
    commissions: v.optional(v.number()),
    notes: v.optional(v.string()),
    strategy: v.optional(v.string()),
    psychology: v.optional(v.string()),
    whatWorked: v.optional(v.string()),
    whatFailed: v.optional(v.string()),
    confidence: v.optional(v.number()),
    setupQuality: v.optional(v.number()),
    ruleViolation: v.optional(v.string()),
    orderType: v.optional(v.string()),
    accountBalanceAfter: v.optional(v.number()),
    riskAmount: v.optional(v.number()),
    stopLoss: v.optional(v.number()),
    marketCondition: v.optional(v.string()),
    htfContext: v.optional(v.string()),
    structureBreakBeforeExit: v.optional(v.string()),
    wouldTakeTradeAgain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const { id, ...updates } = args;

    // Verify the trade belongs to the user
    const trade = await ctx.db.get(id);
    if (!trade) {
      throw new Error('Trade not found');
    }
    if (trade.userId !== userId) {
      throw new Error('Not authorized to update this trade');
    }

    await ctx.db.patch(id, updates);

    const updatedTrade = await ctx.db.get(id);
    return {
      id: updatedTrade!._id,
      symbol: updatedTrade!.symbol,
      entryPrice: updatedTrade!.entryPrice,
      exitPrice: updatedTrade!.exitPrice,
      quantity: updatedTrade!.quantity,
      entryTime: updatedTrade!.entryTime,
      exitTime: updatedTrade!.exitTime,
      side: updatedTrade!.side,
      pnl: updatedTrade!.pnl,
      pnlPercent: updatedTrade!.pnlPercent,
      fees: updatedTrade!.fees,
      commissions: updatedTrade!.commissions,
      notes: updatedTrade!.notes,
      strategy: updatedTrade!.strategy,
      psychology: updatedTrade!.psychology,
      whatWorked: updatedTrade!.whatWorked,
      whatFailed: updatedTrade!.whatFailed,
      confidence: updatedTrade!.confidence,
      setupQuality: updatedTrade!.setupQuality,
      ruleViolation: updatedTrade!.ruleViolation,
      importedFrom: updatedTrade!.importedFrom,
      importId: updatedTrade!.importId,
      orderType: updatedTrade!.orderType,
      accountBalanceAfter: updatedTrade!.accountBalanceAfter,
      riskAmount: updatedTrade!.riskAmount,
      stopLoss: updatedTrade!.stopLoss,
      marketCondition: updatedTrade!.marketCondition,
      htfContext: updatedTrade!.htfContext,
      structureBreakBeforeExit: updatedTrade!.structureBreakBeforeExit,
      wouldTakeTradeAgain: updatedTrade!.wouldTakeTradeAgain,
    };
  },
});

// Mutation to delete a trade
export const deleteTrade = mutation({
  args: {
    id: v.id('trades'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify the trade belongs to the user
    const trade = await ctx.db.get(args.id);
    if (!trade) {
      throw new Error('Trade not found');
    }
    if (trade.userId !== userId) {
      throw new Error('Not authorized to delete this trade');
    }

    await ctx.db.delete(args.id);
  },
});

// Mutation to merge two duplicate trades
// Keeps the imported trade (better source) and deletes the existing one
// Merges fees/importId from CB into the TH trade
export const mergeTrades = mutation({
  args: {
    existingId: v.id('trades'),
    importedId: v.id('trades'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Fetch both trades
    const existing = await ctx.db.get(args.existingId);
    const imported = await ctx.db.get(args.importedId);

    if (!existing || !imported) {
      throw new Error('One or both trades not found');
    }
    if (existing.userId !== userId || imported.userId !== userId) {
      throw new Error('Not authorized');
    }

    // Determine which trade to keep: prefer imported (tos-merged/trade-history) over cash-balance
    // because imported has exact timestamps and orderType
    const tradeToKeep = imported;
    const tradeToDelete = existing;

    // Merge fields: keep imported's base data, add CB's enrichment if available
    const mergedFees = tradeToKeep.fees ?? tradeToDelete.fees ?? undefined;
    const mergedCommissions =
      tradeToKeep.commissions ?? tradeToDelete.commissions ?? undefined;
    const mergedImportId =
      tradeToKeep.importId || tradeToDelete.importId || undefined;
    const mergedAccountBalanceAfter =
      tradeToKeep.accountBalanceAfter ??
      tradeToDelete.accountBalanceAfter ??
      undefined;

    // Update the kept trade with merged data
    await ctx.db.patch(tradeToKeep._id, {
      fees: mergedFees,
      commissions: mergedCommissions,
      importId: mergedImportId,
      accountBalanceAfter: mergedAccountBalanceAfter,
      importedFrom: 'tos-merged',
    });

    // Delete the duplicate
    await ctx.db.delete(tradeToDelete._id);

    return { merged: true, keptId: tradeToKeep._id };
  },
});

// Mutation to clear all trades for the authenticated user
export const clearAllTrades = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const trades = await ctx.db
      .query('trades')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    for (const trade of trades) {
      await ctx.db.delete(trade._id);
    }
  },
});

/**
 * Build a patch object for enriching an existing trade with data from an
 * incoming import.
 *
 * Keep in sync with `src/utils/import-enrichment.ts` — `buildEnrichmentUpdates`.
 */
function buildEnrichmentUpdates(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>
): Record<string, unknown> | null {
  const updates: Record<string, unknown> = {};

  const vendorAuthoritative = [
    'entryPrice',
    'exitPrice',
    'quantity',
    'entryTime',
    'exitTime',
    'pnl',
    'pnlPercent',
    'fees',
    'commissions',
    'orderType',
    'accountBalanceAfter',
    'importedFrom',
  ];

  const fillIfEmpty = ['importId'];

  for (const key of vendorAuthoritative) {
    const incomingValue = incoming[key];
    if (incomingValue !== undefined && incomingValue !== null) {
      const existingValue = existing[key];
      if (existingValue !== incomingValue) {
        updates[key] = incomingValue;
      }
    }
  }

  for (const key of fillIfEmpty) {
    const incomingValue = incoming[key];
    if (incomingValue !== undefined && incomingValue !== null) {
      const existingValue = existing[key];
      if (existingValue === undefined || existingValue === null) {
        updates[key] = incomingValue;
      }
    }
  }

  return Object.keys(updates).length > 0 ? updates : null;
}

// Mutation to import multiple trades
export const importTrades = mutation({
  args: {
    trades: v.array(
      v.object({
        symbol: v.string(),
        entryPrice: v.number(),
        exitPrice: v.number(),
        quantity: v.number(),
        entryTime: v.number(),
        exitTime: v.number(),
        side: v.string(),
        pnl: v.number(),
        pnlPercent: v.number(),
        fees: v.optional(v.number()),
        commissions: v.optional(v.number()),
        notes: v.optional(v.string()),
        strategy: v.optional(v.string()),
        psychology: v.optional(v.string()),
        whatWorked: v.optional(v.string()),
        whatFailed: v.optional(v.string()),
        confidence: v.optional(v.number()),
        setupQuality: v.optional(v.number()),
        ruleViolation: v.optional(v.string()),
        importedFrom: v.optional(v.string()),
        importId: v.optional(v.string()),
        orderType: v.optional(v.string()),
        accountBalanceAfter: v.optional(v.number()),
        riskAmount: v.optional(v.number()),
        stopLoss: v.optional(v.number()),
        marketCondition: v.optional(v.string()),
        htfContext: v.optional(v.string()),
        structureBreakBeforeExit: v.optional(v.string()),
        wouldTakeTradeAgain: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const importType =
      args.trades.length > 0 && args.trades[0].importedFrom
        ? (args.trades[0].importedFrom as string)
        : 'csv';

    // Build importId lookup for trades that have one
    const importIds = args.trades
      .map((t) => t.importId)
      .filter((id): id is string => !!id);

    const importIdMatchMap = new Map<string, (typeof existingByImportId)[0]>();
    const existingByImportId =
      importIds.length > 0
        ? await ctx.db
            .query('trades')
            .withIndex('by_user_and_import_id', (q) => q.eq('userId', userId))
            .collect()
        : [];
    for (const t of existingByImportId) {
      if (t.importId) importIdMatchMap.set(t.importId, t);
    }

    // Fallback: symbol-entryTime-quantity map for trades without importId
    const existingTrades = await ctx.db
      .query('trades')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const existingTradeMap = new Map(
      existingTrades.map((trade) => [
        `${trade.symbol}-${trade.entryTime}-${trade.quantity}`,
        trade,
      ])
    );

    let imported = 0;
    let skipped = 0;
    let updated = 0;
    const skippedDetails: string[] = [];

    for (const trade of args.trades) {
      let existing = null;
      let dedupReason = '';

      // Primary dedup: by importId (reliable Schwab REF #-based key)
      if (trade.importId) {
        existing = importIdMatchMap.get(trade.importId) ?? null;
        if (existing) {
          dedupReason = 'importId';
        }
      }

      // Fallback dedup: by symbol-entryTime-quantity
      if (!existing) {
        const key = `${trade.symbol}-${trade.entryTime}-${trade.quantity}`;
        existing = existingTradeMap.get(key) ?? null;
        if (existing) {
          dedupReason = 'symbol-entryTime-quantity';
        }
      }

      // Tertiary fuzzy dedup: same symbol + same calendar day + TOS source +
      // exact quantity AND entryPrice within 1% (both must match)
      // This prevents false positives when multiple trades on same day
      if (!existing && !trade.importId) {
        const tradeDay = Math.floor(trade.entryTime / 86400000);
        const candidates = existingTrades.filter((t) => {
          if (
            t.importedFrom !== 'tos-merged' &&
            t.importedFrom !== 'trade-history' &&
            t.importedFrom !== 'cash-balance'
          ) {
            return false;
          }
          if (t.symbol !== trade.symbol) return false;
          const existingDay = Math.floor(t.entryTime / 86400000);
          if (existingDay !== tradeDay) return false;
          // Require BOTH exact quantity AND entryPrice within 1%
          if (t.quantity !== trade.quantity) return false;
          const maxPrice = Math.max(t.entryPrice, trade.entryPrice);
          if (maxPrice > 0) {
            const priceDiff = Math.abs(t.entryPrice - trade.entryPrice);
            if (priceDiff / maxPrice <= 0.01) return true;
          }
          return false;
        });
        if (candidates.length === 1) {
          existing = candidates[0];
          dedupReason = 'fuzzy-day-match';
        }
      }

      if (!existing) {
        await ctx.db.insert('trades', { userId, ...trade });
        imported++;
        continue;
      }

      const updates = buildEnrichmentUpdates(
        existing as Record<string, unknown>,
        trade as Record<string, unknown>
      );
      if (updates) {
        await ctx.db.patch(existing._id, updates);
        updated++;
      } else {
        skipped++;
        skippedDetails.push(
          `${trade.symbol} ${trade.quantity}sh @${trade.entryPrice} (${dedupReason})`
        );
      }
    }

    // Create audit log entry
    const auditId = await ctx.db.insert('importAudits', {
      userId,
      importType,
      expectedTrades: args.trades.length,
      importedCount: imported,
      skippedCount: skipped,
      updatedCount: updated,
      errors: skippedDetails.length > 0 ? skippedDetails : undefined,
      importedAt: Date.now(),
    });

    return {
      imported,
      skipped,
      updated,
      auditId: auditId.toString(),
      skippedDetails,
    };
  },
});

// Query to get import audits for the authenticated user
export const getImportAudits = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const audits = await ctx.db
      .query('importAudits')
      .withIndex('by_user_and_time', (q) => q.eq('userId', userId))
      .order('desc')
      .take(args.limit ?? 100);

    return audits.map((audit) => ({
      id: audit._id,
      importType: audit.importType,
      expectedTrades: audit.expectedTrades,
      importedCount: audit.importedCount,
      skippedCount: audit.skippedCount,
      updatedCount: audit.updatedCount,
      unmatchedBuys: audit.unmatchedBuys,
      unmatchedSells: audit.unmatchedSells,
      errors: audit.errors,
      fileName: audit.fileName,
      importedAt: audit.importedAt,
    }));
  },
});

// Internal mutation to migrate structureBreakBeforeExit from boolean to string enum
export const migrateStructureBreakToEnum = internalMutation({
  args: {},
  handler: async (ctx) => {
    const trades = await ctx.db.query('trades').collect();

    let migrated = 0;
    for (const trade of trades) {
      if (typeof trade.structureBreakBeforeExit === 'boolean') {
        await ctx.db.patch(trade._id, {
          structureBreakBeforeExit: trade.structureBreakBeforeExit
            ? 'yes'
            : 'no',
        });
        migrated++;
      }
    }

    return { migrated };
  },
});

// Query to export all trades for a specific user (public, no auth required)
export const exportUserTrades = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const trades = await ctx.db
      .query('trades')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    return trades.map((trade) => ({
      symbol: trade.symbol,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      side: trade.side,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent,
      fees: trade.fees,
      commissions: trade.commissions,
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      setupQuality: trade.setupQuality,
      ruleViolation: trade.ruleViolation,
      importedFrom: trade.importedFrom,
      importId: trade.importId,
      orderType: trade.orderType,
      accountBalanceAfter: trade.accountBalanceAfter,
      riskAmount: trade.riskAmount,
      stopLoss: trade.stopLoss,
      marketCondition: trade.marketCondition,
      htfContext: trade.htfContext,
      structureBreakBeforeExit:
        typeof trade.structureBreakBeforeExit === 'boolean'
          ? trade.structureBreakBeforeExit
            ? 'yes'
            : 'no'
          : trade.structureBreakBeforeExit,
      wouldTakeTradeAgain: trade.wouldTakeTradeAgain,
    }));
  },
});

// Mutation to import trades directly (public, no auth required)
export const importUserTrades = mutation({
  args: {
    userId: v.string(),
    trades: v.array(
      v.object({
        symbol: v.string(),
        entryPrice: v.number(),
        exitPrice: v.number(),
        quantity: v.number(),
        entryTime: v.number(),
        exitTime: v.number(),
        side: v.string(),
        pnl: v.number(),
        pnlPercent: v.number(),
        fees: v.optional(v.number()),
        commissions: v.optional(v.number()),
        notes: v.optional(v.string()),
        strategy: v.optional(v.string()),
        psychology: v.optional(v.string()),
        whatWorked: v.optional(v.string()),
        whatFailed: v.optional(v.string()),
        confidence: v.optional(v.number()),
        setupQuality: v.optional(v.number()),
        ruleViolation: v.optional(v.string()),
        importedFrom: v.optional(v.string()),
        importId: v.optional(v.string()),
        orderType: v.optional(v.string()),
        accountBalanceAfter: v.optional(v.number()),
        riskAmount: v.optional(v.number()),
        stopLoss: v.optional(v.number()),
        marketCondition: v.optional(v.string()),
        htfContext: v.optional(v.string()),
        structureBreakBeforeExit: v.optional(v.string()),
        wouldTakeTradeAgain: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let imported = 0;
    for (const trade of args.trades) {
      await ctx.db.insert('trades', {
        userId: args.userId,
        ...trade,
      });
      imported++;
    }
    return { imported };
  },
});

// Query to find user by email (public, no auth required)
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  },
});

// Mutation to delete trades for a specific user within a date range (public, no auth required)
export const deleteUserTradesInRange = mutation({
  args: {
    userId: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tradesQuery;
    if (args.endTime !== undefined) {
      tradesQuery = ctx.db
        .query('trades')
        .withIndex('by_user_and_exit_time', (q) =>
          q
            .eq('userId', args.userId)
            .gte('exitTime', args.startTime)
            .lte('exitTime', args.endTime!)
        );
    } else {
      tradesQuery = ctx.db
        .query('trades')
        .withIndex('by_user_and_exit_time', (q) =>
          q.eq('userId', args.userId).gte('exitTime', args.startTime)
        );
    }

    const trades = await tradesQuery.collect();

    for (const trade of trades) {
      await ctx.db.delete(trade._id);
    }

    return { deleted: trades.length };
  },
});

// Mutation to delete all trades for a specific user (public, no auth required)
export const deleteUserTrades = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const trades = await ctx.db
      .query('trades')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    for (const trade of trades) {
      await ctx.db.delete(trade._id);
    }

    return { deleted: trades.length };
  },
});
