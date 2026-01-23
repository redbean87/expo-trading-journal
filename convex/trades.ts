import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

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
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      ruleViolation: trade.ruleViolation,
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
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      ruleViolation: trade.ruleViolation,
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
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      ruleViolation: trade.ruleViolation,
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
    notes: v.optional(v.string()),
    strategy: v.optional(v.string()),
    psychology: v.optional(v.string()),
    whatWorked: v.optional(v.string()),
    whatFailed: v.optional(v.string()),
    confidence: v.optional(v.number()),
    ruleViolation: v.optional(v.string()),
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
      notes: args.notes,
      strategy: args.strategy,
      psychology: args.psychology,
      whatWorked: args.whatWorked,
      whatFailed: args.whatFailed,
      confidence: args.confidence,
      ruleViolation: args.ruleViolation,
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
    notes: v.optional(v.string()),
    strategy: v.optional(v.string()),
    psychology: v.optional(v.string()),
    whatWorked: v.optional(v.string()),
    whatFailed: v.optional(v.string()),
    confidence: v.optional(v.number()),
    ruleViolation: v.optional(v.string()),
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
      notes: updatedTrade!.notes,
      strategy: updatedTrade!.strategy,
      psychology: updatedTrade!.psychology,
      whatWorked: updatedTrade!.whatWorked,
      whatFailed: updatedTrade!.whatFailed,
      confidence: updatedTrade!.confidence,
      ruleViolation: updatedTrade!.ruleViolation,
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

// Mutation to clear all trades for the user
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
        notes: v.optional(v.string()),
        strategy: v.optional(v.string()),
        psychology: v.optional(v.string()),
        whatWorked: v.optional(v.string()),
        whatFailed: v.optional(v.string()),
        confidence: v.optional(v.number()),
        ruleViolation: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get existing trades to check for duplicates
    const existingTrades = await ctx.db
      .query('trades')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    // Create a set of existing trade keys
    const existingKeys = new Set(
      existingTrades.map((trade) => {
        const key = `${trade.symbol}-${trade.entryTime}-${trade.quantity}`;
        return key;
      })
    );

    let imported = 0;
    let skipped = 0;

    for (const trade of args.trades) {
      const key = `${trade.symbol}-${trade.entryTime}-${trade.quantity}`;

      if (!existingKeys.has(key)) {
        await ctx.db.insert('trades', {
          userId,
          ...trade,
        });
        existingKeys.add(key);
        imported++;
      } else {
        skipped++;
      }
    }

    return { imported, skipped };
  },
});
