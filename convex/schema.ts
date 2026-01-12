import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Define the Trade table schema
const schema = defineSchema({
  // Auth tables (users, sessions, etc.)
  ...authTables,

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
  }).index('by_user', ['userId']), // Index for efficient user queries
});

export default schema;
