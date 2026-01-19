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
  })
    .index('by_user', ['userId']) // Index for efficient user queries
    .index('by_user_and_entry_time', ['userId', 'entryTime']) // Index for sorted queries
    .index('by_user_and_exit_time', ['userId', 'exitTime']), // Index for date range filtering
});

export default schema;
