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
    displayName: v.optional(v.string()), // Custom journal name (max 50 chars)
    defaultRiskPercent: v.optional(v.number()), // Default risk % per trade
    customThemePreset: v.optional(v.string()), // 'default' | 'custom'
    customColors: v.optional(v.string()), // JSON stringified CustomColors
    defaultTimeRange: v.optional(v.string()), // 'all' | 'today' | 'week' | 'month' | 'year'
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
    fees: v.optional(v.number()), // Misc brokerage fees
    commissions: v.optional(v.number()), // Brokerage commissions
    notes: v.optional(v.string()),
    strategy: v.optional(v.string()),
    psychology: v.optional(v.string()),
    whatWorked: v.optional(v.string()),
    whatFailed: v.optional(v.string()),
    confidence: v.optional(v.number()), // Deprecated: migrating to setupQuality
    setupQuality: v.optional(v.number()),
    ruleViolation: v.optional(v.string()),
    importedFrom: v.optional(v.string()),
    importId: v.optional(v.string()),
    orderType: v.optional(v.string()),
    accountBalanceAfter: v.optional(v.number()),
    riskAmount: v.optional(v.number()),
    stopLoss: v.optional(v.number()),
    marketCondition: v.optional(v.string()),
    htfContext: v.optional(v.string()),
    structureBreakBeforeExit: v.optional(v.union(v.boolean(), v.string())),
    wouldTakeTradeAgain: v.optional(v.string()),
  })
    .index('by_user', ['userId']) // Index for efficient user queries
    .index('by_user_and_entry_time', ['userId', 'entryTime']) // Index for sorted queries
    .index('by_user_and_exit_time', ['userId', 'exitTime']) // Index for date range filtering
    .index('by_user_and_import_id', ['userId', 'importId']), // Index for deduplication

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

  // User-defined and system tag library
  tags: defineTable({
    userId: v.optional(v.string()), // null = system tag
    field: v.string(), // 'strategy' | 'psychology' | 'whatWorked' | 'whatFailed' | 'marketCondition' | 'htfContext' | 'ruleViolation'
    label: v.string(),
    isSystem: v.boolean(),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(), // Unix timestamp
  })
    .index('by_field_system', ['field', 'isSystem'])
    .index('by_user_field', ['userId', 'field'])
    .index('by_field_label', ['field', 'label'])
    .index('by_field_active', ['field', 'isActive'])
    .index('by_system', ['isSystem']),

  // Import audit log for tracking import operations
  importAudits: defineTable({
    userId: v.string(),
    importType: v.string(), // 'csv', 'tos-account-statement'
    expectedTrades: v.number(),
    importedCount: v.number(),
    skippedCount: v.number(),
    updatedCount: v.number(),
    unmatchedBuys: v.optional(v.number()),
    unmatchedSells: v.optional(v.number()),
    errors: v.optional(v.array(v.string())),
    fileName: v.optional(v.string()),
    importedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_time', ['userId', 'importedAt']),

  // User decisions about duplicate trade pairs (cross-device)
  duplicateDecisions: defineTable({
    userId: v.string(),
    tradeAId: v.id('trades'),
    tradeBId: v.id('trades'),
    pairKey: v.string(),
    decision: v.string(), // 'keepBoth' | 'merge' | 'deleteImported' | 'deleteExisting'
    decidedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_pairKey', ['userId', 'pairKey']),
});

export default schema;
