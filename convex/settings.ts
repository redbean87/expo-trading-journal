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
      customThemePreset: user.customThemePreset ?? null,
      customColors: user.customColors ?? null,
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
    customThemePreset: v.optional(v.string()),
    customColors: v.optional(v.string()),
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
    if (args.customThemePreset !== undefined) {
      if (
        args.customThemePreset !== 'default' &&
        args.customThemePreset !== 'custom'
      ) {
        throw new Error('Invalid theme preset');
      }
      updates.customThemePreset = args.customThemePreset;
    }
    if (args.customColors !== undefined) {
      // Validate JSON structure if provided
      if (args.customColors) {
        try {
          const parsed = JSON.parse(args.customColors);
          // Validate current structure: primary, profit, loss required; primaryContainer & onPrimaryContainer optional
          if (!parsed.primary || !parsed.profit || !parsed.loss) {
            throw new Error('Invalid custom colors structure');
          }
          // Validate hex format if provided
          const hexPattern = /^#[0-9A-F]{6}$/i;
          if (
            !hexPattern.test(parsed.primary) ||
            !hexPattern.test(parsed.profit) ||
            !hexPattern.test(parsed.loss)
          ) {
            throw new Error('Invalid color format');
          }
          if (
            parsed.primaryContainer &&
            !hexPattern.test(parsed.primaryContainer)
          ) {
            throw new Error('Invalid primaryContainer format');
          }
          if (
            parsed.onPrimaryContainer &&
            !hexPattern.test(parsed.onPrimaryContainer)
          ) {
            throw new Error('Invalid onPrimaryContainer format');
          }
        } catch {
          throw new Error('Invalid custom colors JSON');
        }
      }
      updates.customColors = args.customColors || null;
    }

    await ctx.db.patch(userId, updates);

    const user = await ctx.db.get(userId);
    return {
      themeMode: user?.themeMode ?? null,
      timezone: user?.timezone ?? null,
      displayName: user?.displayName ?? null,
      customThemePreset: user?.customThemePreset ?? null,
      customColors: user?.customColors ?? null,
      settingsUpdatedAt: user?.settingsUpdatedAt ?? null,
    };
  },
});
