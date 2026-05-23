import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { query } from './_generated/server';

/**
 * Analyzes trades to identify potential duplicates after TOS import merge.
 * Pass userId explicitly for debugging, or omit to use current auth.
 * Run with: npx convex run trades_analysis:analyzeDuplicates --arg userId "your-user-id"
 */
export const analyzeDuplicates = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let userId = args.userId;

    if (!userId) {
      const authUserId = await getAuthUserId(ctx);
      if (authUserId) {
        userId = authUserId;
      }
    }

    if (!userId) {
      return {
        error:
          'No userId provided and not authenticated. Pass --arg userId "your-id" or login first.',
      };
    }

    const trades = await ctx.db
      .query('trades')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    // Group by symbol-entryTime-quantity
    const groups = new Map<string, typeof trades>();
    for (const trade of trades) {
      const key = `${trade.symbol}-${trade.entryTime}-${trade.quantity}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(trade);
    }

    // Find groups with multiple trades (potential duplicates)
    const duplicates = [];
    for (const [key, groupTrades] of groups) {
      if (groupTrades.length > 1) {
        duplicates.push({
          key,
          count: groupTrades.length,
          trades: groupTrades.map((t) => ({
            id: t._id,
            symbol: t.symbol,
            entryTime: new Date(t.entryTime).toISOString(),
            quantity: t.quantity,
            importedFrom: t.importedFrom,
            importId: t.importId,
            pnl: t.pnl,
            fees: t.fees,
            commissions: t.commissions,
          })),
        });
      }
    }

    // Find all 'tos-merged' trades
    const mergedTrades = trades
      .filter((t) => t.importedFrom === 'tos-merged')
      .map((t) => ({
        id: t._id,
        symbol: t.symbol,
        entryTime: new Date(t.entryTime).toISOString(),
        quantity: t.quantity,
        importId: t.importId,
        pnl: t.pnl,
        fees: t.fees,
        commissions: t.commissions,
        orderType: t.orderType,
      }));

    // Summary stats
    const stats = {
      totalTrades: trades.length,
      cashBalanceCount: trades.filter((t) => t.importedFrom === 'cash-balance')
        .length,
      tradeHistoryCount: trades.filter(
        (t) => t.importedFrom === 'trade-history'
      ).length,
      tosMergedCount: trades.filter((t) => t.importedFrom === 'tos-merged')
        .length,
      manualCount: trades.filter((t) => !t.importedFrom).length,
      potentialDuplicateGroups: duplicates.length,
    };

    return {
      stats,
      duplicates: duplicates.slice(0, 20), // Limit to first 20
      mergedTrades: mergedTrades.slice(0, 20),
    };
  },
});
