import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';

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
      email: user.email ?? null,
      themeMode: user.themeMode ?? null,
      timezone: user.timezone ?? null,
      displayName: user.displayName ?? null,
      defaultRiskPercent: user.defaultRiskPercent ?? null,
      customThemePreset: user.customThemePreset ?? null,
      customColors: user.customColors ?? null,
      defaultTimeRange: user.defaultTimeRange ?? null,
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
    defaultRiskPercent: v.optional(v.number()),
    customThemePreset: v.optional(v.string()),
    customColors: v.optional(v.string()),
    defaultTimeRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Build update object with only provided fields
    const updates: Record<string, string | number | null | undefined> = {
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
    if (args.defaultRiskPercent !== undefined) {
      if (
        args.defaultRiskPercent !== null &&
        (args.defaultRiskPercent <= 0 || args.defaultRiskPercent > 100)
      ) {
        throw new Error('Default risk percent must be between 0 and 100');
      }
      updates.defaultRiskPercent = args.defaultRiskPercent;
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
    if (args.defaultTimeRange !== undefined) {
      const validRanges = ['all', 'today', 'week', 'month', 'year'];
      if (
        args.defaultTimeRange &&
        !validRanges.includes(args.defaultTimeRange)
      ) {
        throw new Error('Invalid default time range');
      }
      updates.defaultTimeRange = args.defaultTimeRange || null;
    }
    if (args.customColors !== undefined) {
      // Validate JSON structure if provided
      if (args.customColors) {
        try {
          const parsed = JSON.parse(args.customColors);
          if (
            !parsed.primary ||
            !parsed.profit ||
            !parsed.loss ||
            !parsed.selectedBackground ||
            !parsed.selectedText
          ) {
            throw new Error('Invalid custom colors structure');
          }
          const hexPattern = /^#[0-9A-F]{6}$/i;
          if (
            !hexPattern.test(parsed.primary) ||
            !hexPattern.test(parsed.profit) ||
            !hexPattern.test(parsed.loss) ||
            !hexPattern.test(parsed.selectedBackground) ||
            !hexPattern.test(parsed.selectedText)
          ) {
            throw new Error('Invalid color format');
          }
        } catch {
          throw new Error('Invalid custom colors JSON');
        }
      }
      updates.customColors = args.customColors || undefined;
    }

    await ctx.db.patch(userId, updates);

    const user = await ctx.db.get(userId);
    return {
      themeMode: user?.themeMode ?? null,
      timezone: user?.timezone ?? null,
      displayName: user?.displayName ?? null,
      defaultRiskPercent: user?.defaultRiskPercent ?? null,
      customThemePreset: user?.customThemePreset ?? null,
      customColors: user?.customColors ?? null,
      defaultTimeRange: user?.defaultTimeRange ?? null,
      settingsUpdatedAt: user?.settingsUpdatedAt ?? null,
    };
  },
});

// Query to find a user by email (internal — admin scripts only)
export const findUserByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      themeMode: user.themeMode,
      timezone: user.timezone,
      defaultRiskPercent: user.defaultRiskPercent,
      defaultTimeRange: user.defaultTimeRange,
      customThemePreset: user.customThemePreset,
      customColors: user.customColors,
      settingsUpdatedAt: user.settingsUpdatedAt,
    };
  },
});

// Query to export user settings (internal — admin scripts only)
export const exportUserSettings = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      displayName: user.displayName ?? undefined,
      themeMode: user.themeMode ?? undefined,
      timezone: user.timezone ?? undefined,
      defaultRiskPercent: user.defaultRiskPercent ?? undefined,
      defaultTimeRange: user.defaultTimeRange ?? undefined,
      customThemePreset: user.customThemePreset ?? undefined,
      customColors: user.customColors ?? undefined,
    };
  },
});

// Mutation to import (overwrite) user settings (internal — admin scripts only)
export const importUserSettings = internalMutation({
  args: {
    userId: v.id('users'),
    settings: v.object({
      displayName: v.optional(v.string()),
      themeMode: v.optional(v.string()),
      timezone: v.optional(v.string()),
      defaultRiskPercent: v.optional(v.number()),
      defaultTimeRange: v.optional(v.string()),
      customThemePreset: v.optional(v.string()),
      customColors: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      ...args.settings,
      settingsUpdatedAt: Date.now(),
    });
    return { success: true };
  },
});
