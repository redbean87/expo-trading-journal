# Architecture Overview

## Data Layer Migration: Zustand → React Query

The app has been migrated from Zustand store to React Query for data management. This architecture supports the current local-first approach while making future cloud sync straightforward.

## Current Architecture (Local Storage)

### Services Layer

**Location**: [src/services/trade-service.ts](src/services/trade-service.ts)

The service layer abstracts all storage operations. Currently uses AsyncStorage, but the interface makes it easy to swap in a cloud API later.

**Key Functions**:

- `getTrades()` - Fetch all trades
- `addTrade(trade)` - Add a new trade
- `updateTrade(id, updates)` - Update an existing trade
- `deleteTrade(id)` - Delete a trade
- `clearAllTrades()` - Delete all trades
- `importTrades(trades)` - Import multiple trades with duplicate detection

### React Query Hooks

**Location**: [src/hooks/use-trades-query.ts](src/hooks/use-trades-query.ts)

Custom hooks that wrap the service layer with React Query functionality:

- `useTradesQuery()` - Fetch and cache all trades
- `useAddTradeMutation()` - Add a trade with automatic cache invalidation
- `useUpdateTradeMutation()` - Update a trade with automatic cache invalidation
- `useDeleteTradeMutation()` - Delete a trade with automatic cache invalidation
- `useClearTradesMutation()` - Clear all trades with automatic cache invalidation
- `useImportTradesMutation()` - Import trades with automatic cache invalidation

### Query Configuration

**Location**: [src/providers/query-provider.tsx](src/providers/query-provider.tsx)

React Query client configured for mobile:

- **staleTime**: 5 minutes (data stays fresh)
- **gcTime**: 30 minutes (cache garbage collection)
- **retry**: 1 attempt on failure
- **refetchOnWindowFocus**: disabled (not relevant for mobile)

## Benefits of This Architecture

### 1. Automatic Caching

React Query caches trade data automatically, reducing AsyncStorage reads.

### 2. Optimistic Updates (Easy to Add)

Can add optimistic UI updates for instant feedback before server confirms.

### 3. Background Refetching

Automatically refetches stale data when screen comes into focus (when enabled).

### 4. Deduplication

Multiple components requesting the same data will only trigger one network/storage request.

### 5. Easy Migration to Cloud

The service layer abstraction means cloud sync requires minimal changes to components.

## Migration Path to Cloud Sync

### Phase 1: Add Cloud API (Recommended: Supabase or Firebase)

1. **Create API Service**

   ```typescript
   // src/services/api-service.ts
   export const apiService = {
     async getTrades(userId: string): Promise<Trade[]> {
       // Fetch from cloud API
     },
     async addTrade(userId: string, trade: Trade): Promise<Trade> {
       // Post to cloud API
     },
     // ... other CRUD operations
   }
   ```

2. **Update Service Layer to Sync**

   ```typescript
   // src/services/trade-service.ts
   export const tradeService = {
     async getTrades(): Promise<Trade[]> {
       // Try cloud first, fallback to local
       try {
         const cloudTrades = await apiService.getTrades(userId);
         // Save to local cache
         await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cloudTrades));
         return cloudTrades;
       } catch (error) {
         // Offline: use local cache
         return getLocalTrades();
       }
     },
     // ... similar for other operations
   }
   ```

3. **No Component Changes Needed!**
   Components use the same hooks, they just automatically sync to cloud now.

### Phase 2: Add Offline Queue (Optional)

For better offline support, add a queue for mutations that failed while offline:

```typescript
// src/services/sync-queue.ts
export const syncQueue = {
  async addToQueue(operation: PendingOperation): Promise<void> {
    // Store operation in queue
  },
  async processQueue(): Promise<void> {
    // Process all pending operations when back online
  }
}
```

### Phase 3: Real-time Sync (Optional)

Add WebSocket/SSE for real-time updates across devices:

```typescript
// Listen for changes from other devices
useEffect(() => {
  const unsubscribe = apiService.subscribeToTrades(userId, (updatedTrades) => {
    queryClient.setQueryData(tradeKeys.list(), updatedTrades);
  });
  return unsubscribe;
}, [userId]);
```

## Current State Management

### React Query (Data/Server State)

- Trade data (CRUD operations)
- Cache management
- Loading/error states
- Automatic refetching

### Zustand (Client/UI State)

**Location**: [src/store/theme-store.ts](src/store/theme-store.ts)

- Theme mode (light/dark)
- Other UI preferences

**Note**: The old [trade-store.ts](src/store/trade-store.ts) is now unused and can be deleted.

## Testing

All screens have been migrated:

- [x] Home Screen - Uses `useTradesQuery()`
- [x] Trades Screen - Uses `useTradesQuery()`, `useDeleteTradeMutation()`, `useImportTradesMutation()`
- [x] Add Trade Screen - Uses `useAddTradeMutation()`
- [x] Analytics Screen - Uses `useTradesQuery()`

Type checking passes: `npm run typecheck` ✓

## Recommended Next Steps

1. **Test the app** - Ensure all CRUD operations work correctly
2. **Delete old store** - Remove `src/store/trade-store.ts` and its tests
3. **Choose cloud provider** - Research Supabase (PostgreSQL) vs Firebase (NoSQL)
4. **Add authentication** - Users need accounts for cloud sync
5. **Implement API service** - Create cloud CRUD operations
6. **Update trade-service.ts** - Add cloud sync logic with offline fallback

## Cloud Service Recommendations

### Supabase (Recommended)

**Pros**:

- PostgreSQL (relational, powerful queries)
- Built-in auth, real-time subscriptions
- Row-level security
- Free tier: 500MB database, 2GB bandwidth
- TypeScript SDK with great DX

**Best for**: You want structure, complex analytics, and real-time sync

### Firebase

**Pros**:

- NoSQL (simple, flexible)
- Offline persistence built-in
- Great mobile SDKs
- Free tier: 1GB storage, 10GB bandwidth

**Best for**: Rapid prototyping, simple data model

### Custom API (Node.js/Postgres)

**Pros**:

- Full control
- Can add advanced features later

**Cons**:

- More setup/maintenance
- Need to handle auth, hosting, backups

## Questions?

Reach out if you need help with:

- Choosing a cloud provider
- Implementing authentication
- Setting up the sync logic
- Handling offline scenarios
- Real-time updates
