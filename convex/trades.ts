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

    for (const trade of args.trades) {
      // Primary dedup: by importId (reliable Schwab REF #-based key)
      if (trade.importId) {
        const existingById = importIdMatchMap.get(trade.importId);
        if (existingById) {
          skipped++;
          continue;
        }
        // Also check fallback key — handles existing trades that predate importId
        // and upgrades them with the new fields instead of inserting a duplicate
        const fallbackKey = `${trade.symbol}-${trade.entryTime}-${trade.quantity}`;
        const existingByKey = existingTradeMap.get(fallbackKey);
        if (existingByKey) {
          await ctx.db.patch(existingByKey._id, {
            importId: trade.importId,
            orderType: trade.orderType,
            accountBalanceAfter: trade.accountBalanceAfter,
          });
          updated++;
          continue;
        }
        await ctx.db.insert('trades', { userId, ...trade });
        imported++;
        continue;
      }

      // Fallback dedup: by symbol-entryTime-quantity
      const key = `${trade.symbol}-${trade.entryTime}-${trade.quantity}`;
      const existing = existingTradeMap.get(key);

      if (!existing) {
        await ctx.db.insert('trades', { userId, ...trade });
        existingTradeMap.set(key, { userId, ...trade } as never);
        imported++;
      } else if (
        existing.importedFrom === 'trade-history' &&
        (trade.importedFrom === 'cash-balance' ||
          trade.importedFrom === 'tos-merged')
      ) {
        await ctx.db.patch(existing._id, {
          fees: trade.fees,
          commissions: trade.commissions,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          pnl: trade.pnl,
          pnlPercent: trade.pnlPercent,
          importedFrom: trade.importedFrom,
          importId: trade.importId,
          accountBalanceAfter: trade.accountBalanceAfter,
        });
        updated++;
      } else {
        skipped++;
      }
    }

    return { imported, skipped, updated };
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
