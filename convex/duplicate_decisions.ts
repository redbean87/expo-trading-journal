import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

const VALID_DECISIONS = new Set([
  'keepBoth',
  'merge',
  'deleteImported',
  'deleteExisting',
]);

function makePairKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

export const getDuplicateDecisions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const decisions = await ctx.db
      .query('duplicateDecisions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();

    return decisions.map((decision) => ({
      id: decision._id,
      tradeAId: decision.tradeAId,
      tradeBId: decision.tradeBId,
      pairKey: decision.pairKey,
      decision: decision.decision,
      decidedAt: decision.decidedAt,
    }));
  },
});

export const recordDuplicateDecision = mutation({
  args: {
    tradeAId: v.id('trades'),
    tradeBId: v.id('trades'),
    decision: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    if (!VALID_DECISIONS.has(args.decision)) {
      throw new Error('Invalid duplicate decision');
    }

    const [tradeAId, tradeBId] = [args.tradeAId, args.tradeBId].sort();
    const pairKey = makePairKey(tradeAId, tradeBId);

    const existing = await ctx.db
      .query('duplicateDecisions')
      .withIndex('by_user_and_pairKey', (q) =>
        q.eq('userId', userId).eq('pairKey', pairKey)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        decision: args.decision,
        decidedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert('duplicateDecisions', {
      userId,
      tradeAId,
      tradeBId,
      pairKey,
      decision: args.decision,
      decidedAt: Date.now(),
    });
  },
});
