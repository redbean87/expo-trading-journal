# Architecture Overview

## Current Architecture: Convex Backend with Zustand UI State

The app uses a **local-first with cloud sync** architecture:

- **Convex** handles data persistence, real-time sync, and authentication
- **Zustand** manages client-side UI state
- **AsyncStorage** provides offline caching

## Data Layer

### Backend (Convex)

**Location**: `convex/` directory

- **[schema.ts](convex/schema.ts)** - Database schema with trades and auth tables
- **[auth.config.ts](convex/auth.config.ts)** - Authentication configuration (email/password + Google)
- **[trades.ts](convex/trades.ts)** - CRUD operations for trades with user authorization
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
- `useImportTrades()` - Bulk import with duplicate detection

### Service Abstraction

**Location**: [src/services/trade-service.ts](src/services/trade-service.ts)

The service layer abstracts Convex operations, making it easy to swap backends if needed:

- `getTrades()` - Fetch all trades
- `addTrade(trade)` - Add a new trade
- `updateTrade(id, updates)` - Update an existing trade
- `deleteTrade(id)` - Delete a trade
- `clearAllTrades()` - Delete all trades
- `importTrades(trades)` - Import multiple trades with duplicate detection

## State Management

### Convex (Server/Data State)

- Trade data with real-time sync across devices
- Authentication state (user session)
- Automatic cache invalidation on mutations

### Zustand Stores (Client/UI State)

**Location**: `src/store/`

| Store                                               | Purpose                                    |
| --------------------------------------------------- | ------------------------------------------ |
| [theme-store.ts](src/store/theme-store.ts)          | Light/dark mode preference                 |
| [timezone-store.ts](src/store/timezone-store.ts)    | User timezone setting                      |
| [analytics-store.ts](src/store/analytics-store.ts)  | Selected date range for analytics          |
| [trades-ui-store.ts](src/store/trades-ui-store.ts)  | Selected trade ID for master-detail view   |
| [trade-store.ts](src/store/trade-store.ts)          | Legacy local storage (offline fallback)    |

## Authentication

**Provider**: Convex Auth with `@auth/core`

- **Email/password** authentication
- **Google Sign-In** via OAuth
- Secure token storage with `expo-secure-store`
- All routes protected by `AuthGate` component

**Key Files**:

- [src/hooks/use-auth.ts](src/hooks/use-auth.ts) - Auth hooks (signIn, signUp, signOut, signInWithGoogle)
- [src/components/auth-gate.tsx](src/components/auth-gate.tsx) - Protects routes when not authenticated
- [src/providers/convex-provider.tsx](src/providers/convex-provider.tsx) - Convex client with secure storage

## Benefits of This Architecture

### 1. Real-time Sync

Convex provides automatic real-time updates across devices. Add a trade on mobile, it appears instantly on web.

### 2. Type Safety

Convex generates TypeScript types from your schema, ensuring end-to-end type safety.

### 3. Simple Abstraction

Screens use hooks (`useTrades`), hooks use Convex. Components don't need to know about the backend implementation.

### 4. Offline Support

AsyncStorage caches data locally. The trade store provides fallback when offline.

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
4. **New queries**: Add to `convex/trades.ts`, create hook in `src/hooks/`

## Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
