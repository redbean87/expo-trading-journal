import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// System tag definitions — idempotent seed data
export const SYSTEM_TAG_DEFINITIONS = {
  strategy: [
    'Key Level Breakout',
    'Pullback (Trend Continuation)',
    'Range Break / Consolidation Break',
    'Reversal',
  ],
  marketCondition: ['Trend', 'Range', 'Choppy', 'High Momentum'],
  htfContext: ['Clear', 'Resistance Above', 'Support Below', 'Range'],
  psychology: [
    'Calm',
    'Confident',
    'Focused',
    'Disciplined',
    'Neutral',
    'Anxious',
    'FOMO',
    'Fear',
    'Greed',
    'Frustrated',
    'Hesitant',
  ],
  ruleViolation: [
    'Exited Too Early',
    'Exited Too Late',
    'No Valid Setup',
    'Oversized Position',
    'FOMO Entry',
    'Revenge Trade',
    'No Stop Loss',
    'Moved Stop Loss',
    'Wrong Direction',
    'Poor Entry Timing',
    'Ignored Trading Rules',
  ],
  whatFailed: [
    'Poor Entry Timing',
    'Chased Move',
    'Late in Move',
    'Entered Into Resistance',
    'Entered Into Support',
    'Range / Choppy Conditions',
    'Weak Volume',
    'No Clear Trend Continuation',
    'No Higher Timeframe Level',
    'Premature Exit (Read Issue)',
    'Held Too Long',
    "Didn't Follow Plan",
  ],
  whatWorked: [
    'Waited for Confirmation',
    'Entered on Pullback',
    'Followed Plan',
    'Good Patience',
    'Strong Momentum Setup',
    'Respected Key Level',
    'VWAP Entry',
    'Trend Alignment',
    'Scaled Out Properly',
  ],
} as const;

export type TagField = keyof typeof SYSTEM_TAG_DEFINITIONS;

// Query to get all active tags for a field (system + user)
export const getTags = query({
  args: {
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get system tags for this field (always active)
    const systemTags = await ctx.db
      .query('tags')
      .withIndex('by_field_system', (q) =>
        q.eq('field', args.field).eq('isSystem', true)
      )
      .collect();

    // Get user's custom tags for this field
    const userTags = await ctx.db
      .query('tags')
      .withIndex('by_user_field', (q) =>
        q.eq('userId', userId).eq('field', args.field)
      )
      .collect();

    // Merge, filter active, sort
    const allTags = [...systemTags, ...userTags]
      .filter((tag) => tag.isActive)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.label.localeCompare(b.label);
      });

    return allTags.map((tag) => ({
      id: tag._id,
      label: tag.label,
      isSystem: tag.isSystem,
      isActive: tag.isActive,
      sortOrder: tag.sortOrder,
    }));
  },
});

// Query to check if system tags have been seeded
export const hasSystemTags = query({
  args: {},
  handler: async (ctx) => {
    const systemTags = await ctx.db
      .query('tags')
      .withIndex('by_system', (q) => q.eq('isSystem', true))
      .collect();
    return systemTags.length > 0;
  },
});

// Mutation to seed system tags (idempotent)
export const ensureSystemTags = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSystemTags = await ctx.db
      .query('tags')
      .withIndex('by_system', (q) => q.eq('isSystem', true))
      .collect();

    if (existingSystemTags.length > 0) {
      return { seeded: false, message: 'System tags already exist' };
    }

    const now = Date.now();
    let sortOrder = 0;

    for (const [field, labels] of Object.entries(SYSTEM_TAG_DEFINITIONS)) {
      for (const label of labels) {
        await ctx.db.insert('tags', {
          field,
          label,
          isSystem: true,
          isActive: true,
          sortOrder,
          createdAt: now,
        });
        sortOrder++;
      }
    }

    return { seeded: true, count: sortOrder };
  },
});

// Mutation to add a custom user tag
export const addTag = mutation({
  args: {
    field: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Normalize label
    const normalizedLabel = args.label.trim();
    if (!normalizedLabel) {
      throw new Error('Tag label cannot be empty');
    }

    // Check if tag already exists (system or user)
    const existingTags = await ctx.db
      .query('tags')
      .withIndex('by_field_label', (q) => q.eq('field', args.field))
      .collect();

    const existing = existingTags.find(
      (tag) => tag.label.toLowerCase() === normalizedLabel.toLowerCase()
    );

    if (existing) {
      // If user created it and it's disabled, re-enable it
      if (existing.userId === userId && !existing.isActive) {
        await ctx.db.patch(existing._id, { isActive: true });
        return {
          id: existing._id,
          label: existing.label,
          isSystem: existing.isSystem,
          isActive: true,
          reactivated: true,
        };
      }

      // Return existing tag
      return {
        id: existing._id,
        label: existing.label,
        isSystem: existing.isSystem,
        isActive: existing.isActive,
        reactivated: false,
      };
    }

    // Get max sort order for this field
    const fieldTags = await ctx.db
      .query('tags')
      .withIndex('by_field_system', (q) => q.eq('field', args.field))
      .collect();

    const maxSortOrder = fieldTags.reduce(
      (max, tag) => Math.max(max, tag.sortOrder),
      -1
    );

    const tagId = await ctx.db.insert('tags', {
      userId,
      field: args.field,
      label: normalizedLabel,
      isSystem: false,
      isActive: true,
      sortOrder: maxSortOrder + 1,
      createdAt: Date.now(),
    });

    return {
      id: tagId,
      label: normalizedLabel,
      isSystem: false,
      isActive: true,
      reactivated: false,
    };
  },
});

// Mutation to disable a tag (works on both system and user tags)
export const disableTag = mutation({
  args: {
    id: v.id('tags'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const tag = await ctx.db.get(args.id);
    if (!tag) {
      throw new Error('Tag not found');
    }

    await ctx.db.patch(args.id, { isActive: false });
    return { success: true };
  },
});

// Mutation to delete a user-created tag
export const deleteTag = mutation({
  args: {
    id: v.id('tags'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const tag = await ctx.db.get(args.id);
    if (!tag) {
      throw new Error('Tag not found');
    }

    if (tag.isSystem) {
      throw new Error('System tags cannot be deleted, only disabled');
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
