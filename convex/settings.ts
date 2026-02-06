import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// Query to get current user's settings
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null; // Not authenticated - return null instead of throwing
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return {
      themeMode: user.themeMode ?? null,
      timezone: user.timezone ?? null,
      displayName: user.displayName ?? null,
      settingsUpdatedAt: user.settingsUpdatedAt ?? null,
    };
  },
});

// Mutation to update user settings
export const updateSettings = mutation({
  args: {
    themeMode: v.optional(v.string()),
    timezone: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Build update object with only provided fields
    const updates: Record<string, string | number | null> = {
      settingsUpdatedAt: Date.now(),
    };

    if (args.themeMode !== undefined) {
      updates.themeMode = args.themeMode;
    }
    if (args.timezone !== undefined) {
      updates.timezone = args.timezone;
    }
    if (args.displayName !== undefined) {
      // Validate max length
      if (args.displayName && args.displayName.length > 50) {
        throw new Error('Display name must be 50 characters or less');
      }
      // Normalize empty string to null
      const trimmed = args.displayName.trim();
      updates.displayName = trimmed === '' ? null : trimmed;
    }

    await ctx.db.patch(userId, updates);

    const user = await ctx.db.get(userId);
    return {
      themeMode: user?.themeMode ?? null,
      timezone: user?.timezone ?? null,
      displayName: user?.displayName ?? null,
      settingsUpdatedAt: user?.settingsUpdatedAt ?? null,
    };
  },
});
