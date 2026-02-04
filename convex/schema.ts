import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Define the Trade table schema
const schema = defineSchema({
  // Auth tables (users, sessions, etc.)
  ...authTables,

  // Override users table to add email index for account linking
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    // User settings (synced across devices)
    themeMode: v.optional(v.string()), // 'light' | 'dark'
    timezone: v.optional(v.string()), // IANA timezone string
    settingsUpdatedAt: v.optional(v.number()), // Timestamp for conflict resolution
  }).index('by_email', ['email']),

  // Trades table
  trades: defineTable({
    userId: v.string(), // Link to authenticated user
    symbol: v.string(),
    entryPrice: v.number(),
    exitPrice: v.number(),
    quantity: v.number(),
    entryTime: v.number(), // Unix timestamp
    exitTime: v.number(), // Unix timestamp
    side: v.string(), // 'long' or 'short'
    pnl: v.number(), // Profit/loss in dollars
    pnlPercent: v.number(), // Profit/loss as percentage
    notes: v.optional(v.string()),
    strategy: v.optional(v.string()),
    psychology: v.optional(v.string()),
    whatWorked: v.optional(v.string()),
    whatFailed: v.optional(v.string()),
    confidence: v.optional(v.number()),
    ruleViolation: v.optional(v.string()),
  })
    .index('by_user', ['userId']) // Index for efficient user queries
    .index('by_user_and_entry_time', ['userId', 'entryTime']) // Index for sorted queries
    .index('by_user_and_exit_time', ['userId', 'exitTime']), // Index for date range filtering

  // Trade screenshot attachments stored in Cloudflare R2
  attachments: defineTable({
    userId: v.string(),
    tradeId: v.id('trades'),
    storageKey: v.string(), // R2 object key
    filename: v.string(),
    contentType: v.string(), // image/jpeg or image/png
    size: v.number(), // File size in bytes
    uploadedAt: v.number(), // Unix timestamp
  })
    .index('by_trade', ['tradeId'])
    .index('by_user', ['userId']),
});

export default schema;
