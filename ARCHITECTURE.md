# Architecture Overview

## Current Architecture: Convex Backend with Zustand UI State

The app uses a **local-first with cloud sync** architecture:

- **Convex** handles data persistence, real-time sync, and authentication
- **Zustand** manages client-side UI state
- **AsyncStorage** provides offline caching
- **Service worker** enables PWA offline support on web

## Data Layer

### Backend (Convex)

**Location**: `convex/` directory

- **[schema.ts](convex/schema.ts)** - Database schema with trades, users, attachments, tags, import audits, and duplicate decisions
- **[auth.ts](convex/auth.ts)** - Authentication configuration (email/password + Google) and account-linking logic
- **[auth.config.ts](convex/auth.config.ts)** - JWT provider configuration for Convex Auth
- **[trades.ts](convex/trades.ts)** - CRUD operations for trades with user authorization
- **[trades_analysis.ts](convex/trades_analysis.ts)** - Server-side trade analytics queries
- **[settings.ts](convex/settings.ts)** - User settings sync across devices
- **[tags.ts](convex/tags.ts)** - System and user-defined tag library
- **[attachments.ts](convex/attachments.ts)** - Screenshot upload URLs and metadata
- **[duplicate_decisions.ts](convex/duplicate_decisions.ts)** - Persist duplicate resolution decisions across devices
- **[http.ts](convex/http.ts)** - HTTP routes for authentication endpoints

### Frontend Hooks

**Location**: [src/hooks/use-trades.ts](src/hooks/use-trades.ts)

Custom hooks that wrap Convex's `useQuery` and `useMutation`:

- `useTrades()` - Fetch all trades for the current user
- `useTradesInRange(from, to)` - Fetch trades within a date range
- `useTrade(id)` - Fetch a single trade by ID
- `useAddTrade()` - Add a new trade
- `useUpdateTrade()` - Update an existing trade
- `useDeleteTrade()` - Delete a trade
- `useClearAllTrades()` - Remove all trades
- `useImportTrades()` - Bulk import with duplicate detection and enrichment

**Other key hooks**:

- [src/hooks/use-auth.ts](src/hooks/use-auth.ts) - Authentication actions (login, register, Google sign-in, logout)
- [src/hooks/use-settings.ts](src/hooks/use-settings.ts) - User settings with cross-device sync
- [src/hooks/use-tags.ts](src/hooks/use-tags.ts) - Tag library management
- [src/hooks/use-attachments.ts](src/hooks/use-attachments.ts) - Trade screenshot management
- [src/hooks/use-duplicate-detection.ts](src/hooks/use-duplicate-detection.ts) - Detect duplicate trades during import
- [src/hooks/use-duplicate-decisions.ts](src/hooks/use-duplicate-decisions.ts) - Persist and apply duplicate decisions
- [src/hooks/use-network-status.ts](src/hooks/use-network-status.ts) - Online/offline detection
- [src/hooks/use-service-worker.ts](src/hooks/use-service-worker.ts) - PWA update prompting
- [src/hooks/use-trade-filters.ts](src/hooks/use-trade-filters.ts) - Trade list filtering

### Service Abstraction

**Location**: [src/services/trade-service.ts](src/services/trade-service.ts)

The service layer abstracts Convex operations, making it easy to swap backends if needed:

- `getTrades()` - Fetch all trades
- `addTrade(trade)` - Add a new trade
- `updateTrade(id, updates)` - Update an existing trade
- `deleteTrade(id)` - Delete a trade
- `clearAllTrades()` - Delete all trades
- `importTrades(trades)` - Import multiple trades with duplicate detection

**API service**: [src/services/api-trade-service.ts](src/services/api-trade-service.ts) implements the same interface against Convex.

## State Management

### Convex (Server/Data State)

- Trade data with real-time sync across devices
- Authentication state (user session)
- User settings, tags, and attachments
- Automatic cache invalidation on mutations

### Zustand Stores (Client/UI State)

**Location**: `src/store/`

| Store                                                            | Purpose                                  |
| ---------------------------------------------------------------- | ---------------------------------------- |
| [theme-store.ts](src/store/theme-store.ts)                       | Light/dark mode preference               |
| [custom-theme-store.ts](src/store/custom-theme-store.ts)         | Custom accent colors and theme preset    |
| [timezone-store.ts](src/store/timezone-store.ts)                 | User timezone setting                    |
| [analytics-store.ts](src/store/analytics-store.ts)               | Selected date range for analytics        |
| [time-filter-store.ts](src/store/time-filter-store.ts)           | Global time filter shared across screens |
| [profile-store.ts](src/store/profile-store.ts)                   | User profile (display name)              |
| [trades-ui-store.ts](src/store/trades-ui-store.ts)               | Selected trade ID for master-detail view |
| [duplicate-review-store.ts](src/store/duplicate-review-store.ts) | Duplicate review UI state                |
| [trade-store.ts](src/store/trade-store.ts)                       | Legacy local storage (offline fallback)  |

## Authentication

**Provider**: Convex Auth with `@auth/core`

- **Email/password** authentication
- **Google Sign-In** via OAuth
- Secure token storage with `expo-secure-store`
- All routes protected by `AuthGate` component
- Account linking by email when a user signs in with different providers

**Key Files**:

- [src/hooks/use-auth.ts](src/hooks/use-auth.ts) - Auth hooks (login, register, signInWithGoogle, logout)
- [src/components/auth-gate.tsx](src/components/auth-gate.tsx) - Protects routes when not authenticated
- [src/providers/convex-provider.tsx](src/providers/convex-provider.tsx) - Convex client with secure storage
- [src/providers/settings-sync-provider.tsx](src/providers/settings-sync-provider.tsx) - Syncs settings after auth

## Benefits of This Architecture

### 1. Real-time Sync

Convex provides automatic real-time updates across devices. Add a trade on mobile, it appears instantly on web.

### 2. Type Safety

Convex generates TypeScript types from your schema, ensuring end-to-end type safety.

### 3. Simple Abstraction

Screens use hooks (`useTrades`), hooks use Convex. Components don't need to know about the backend implementation.

### 4. Offline Support

AsyncStorage caches data locally. The network status hook shows an offline banner, and the service worker enables PWA functionality on web.

### 5. Easy Backend Swaps

The service layer abstraction means switching from Convex to another backend (Firebase, Supabase) requires minimal changes to components.

## Key Patterns

### Screen Components

Screens fetch data using hooks and compose UI components:

```typescript
// Example: trades-screen.tsx
function TradesScreen() {
  const trades = useTrades();
  const deleteTrade = useDeleteTrade();

  return <TradeList trades={trades} onDelete={deleteTrade} />;
}
```

### Mutations with Optimistic Updates

Convex mutations update the cache immediately, providing instant feedback:

```typescript
const addTrade = useAddTrade();

// This updates the UI immediately, then syncs to server
await addTrade(newTrade);
```

### Analytics Hooks

Analytics are computed client-side from trade data:

- [use-trade-analytics.ts](src/hooks/use-trade-analytics.ts) - Core metrics (win rate, P&L, streaks)
- [use-equity-curve.ts](src/hooks/use-equity-curve.ts) - Cumulative P&L chart data
- [use-daily-pnl.ts](src/hooks/use-daily-pnl.ts) - Daily breakdown
- [use-time-of-day-breakdown.ts](src/hooks/use-time-of-day-breakdown.ts) - Hourly analysis
- [use-day-of-week-breakdown.ts](src/hooks/use-day-of-week-breakdown.ts) - Weekday analysis
- [use-mistake-analytics.ts](src/hooks/use-mistake-analytics.ts) - Error pattern analysis
- [use-period-breakdown.ts](src/hooks/use-period-breakdown.ts) - Monthly/weekly performance breakdown
- [use-trades-summary.ts](src/hooks/use-trades-summary.ts) - Aggregated trades summary
- [use-symbol-performance.ts](src/hooks/use-symbol-performance.ts) - Performance grouped by symbol
- [use-strategy-analytics.ts](src/hooks/use-strategy-analytics.ts) - Performance by strategy
- [use-market-condition-analytics.ts](src/hooks/use-market-condition-analytics.ts) - Performance by market condition
- [use-htf-context-analytics.ts](src/hooks/use-htf-context-analytics.ts) - Performance by HTF context
- [use-confidence-analytics.ts](src/hooks/use-confidence-analytics.ts) - Setup quality correlation
- [use-ai-report.ts](src/hooks/use-ai-report.ts) - Composed analytics for AI insights

## Import & Duplicate Flow

1. User imports CSV or Thinkorswim statement
2. `useImportTrades` sends parsed trades to Convex
3. Convex matches candidates by `importId` or symbol + entry time + quantity
4. Existing trades are enriched with vendor-authoritative fields (prices, fees, timestamps)
5. New trades are inserted
6. Unresolved duplicates are surfaced to `duplicate-review.tsx`
7. User decisions are persisted in `duplicateDecisions` table for cross-device consistency

## Development Workflow

### Daily Development

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start Expo
npm start
```

### Making Changes

1. **Schema changes**: Edit `convex/schema.ts`, types regenerate automatically
2. **Backend logic**: Edit `convex/*.ts` files
3. **Frontend**: Edit `src/` files, use existing hooks
4. **New queries**: Add to `convex/trades.ts` or `convex/trades_analysis.ts`, create hook in `src/hooks/`

## Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
