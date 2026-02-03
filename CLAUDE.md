# Trading Journal App - Claude Guidelines

## Project Overview

A mobile trading journal app built with Expo/React Native for tracking and analyzing trades.

## Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Backend**: Convex (cloud database + auth + real-time sync)
- **Storage**: AsyncStorage
- **Node**: 20.x (managed via Volta)

## Project Structure

```
app/
  _layout.tsx        # Root layout (ConvexProvider, PaperProvider)
  add-trade.tsx      # Add trade modal route
  (tabs)/
    _layout.tsx      # Tab navigator configuration
    index.tsx        # Home screen route
    trades.tsx       # Trades list screen route
    profile.tsx      # Profile/settings screen route
    analytics/       # Analytics with nested tab routes
      _layout.tsx    # Analytics tab navigator
      index.tsx      # Overview tab
      charts.tsx     # Charts tab
      psychology.tsx # Psychology tab
      timing.tsx     # Timing tab
  auth/
    callback.tsx     # OAuth callback handler
  edit-trade/
    [id].tsx         # Edit trade modal (dynamic route)
  trade/
    [id].tsx         # Trade detail modal (dynamic route)
src/
  components/        # Reusable components (used across multiple screens)
  config/            # App configuration
  constants/         # Constant values (e.g., mistake categories)
  hooks/             # Custom React hooks
  polyfills/         # Platform polyfills
  providers/         # React context providers (Convex, settings sync)
  schemas/           # Zod validation schemas
  screens/           # Screen components (re-exported by app/ routes)
    <screen-name>/   # Screen-specific components (co-located)
  services/          # Backend service abstraction
  store/             # Zustand stores
  theme/             # Theme configuration
  types/             # TypeScript interfaces and types
  utils/             # Utility functions
```

## Code Style

### Components

- Use functional components with hooks
- Use default exports for screens
- Use named exports for reusable components
- Keep components focused and single-purpose
- Extract pure functions to utility files (avoid recreating functions on every render)

### Component Organization

**Screen Files**: Keep main screen files clean and focused on orchestration. Screen files should:

- Be under 150 lines when possible
- Primarily handle data fetching and state management
- Compose smaller components together
- Avoid complex JSX structures or inline conditional rendering

**When to Extract Components**:

- Any JSX block over 30 lines should be considered for extraction
- Repeated UI patterns across screens → extract to `src/components/`
- Screen-specific UI sections → extract to `src/screens/<screen-name>/`
- Complex conditional rendering → use the `EmptyState` component pattern

**Component Structure Examples**:

```text
src/components/
  stat-card.tsx        # Reusable across home & analytics screens
  trade-card.tsx       # Reusable across trades & search screens
  empty-state.tsx      # Reusable wrapper for conditional rendering

src/screens/
  home-screen.tsx      # Main screen (clean, orchestrates components)
  home/
    home-header.tsx    # Screen-specific header
    recent-trades-card.tsx  # Screen-specific card
```

**Avoid Ternaries for Conditional Rendering**: Use the `EmptyState` component to handle empty data states:

```tsx
// ❌ Avoid
{data.length === 0 ? <EmptyView /> : <ListView data={data} />}

// ✅ Prefer
<EmptyState data={data} title="No data" subtitle="Add some data">
  <ListView data={data} />
</EmptyState>
```

### TypeScript

- Define types in `src/types/index.ts`
- Use strict typing - avoid `any` when possible
- Always use `type` instead of `interface`

### State Management

- Use Zustand for global state
- Persist data with AsyncStorage
- Keep store actions async when dealing with storage

### Abstraction

- Components should not reveal underlying frameworks or libraries
- Abstract backend services behind generic hooks (e.g., `useTrades` not `useConvexTrades`)
- Keep implementation details in dedicated files, expose clean interfaces to consumers

### Naming Conventions

- **Files**: kebab-case (e.g., `home-screen.tsx`, `trade-store.ts`)
- **Components/Types**: PascalCase (e.g., `HomeScreen`, `Trade`)
- **Functions/Variables/Hooks**: camelCase (e.g., `useTradeStore`, `loadTrades`)

## Don'ts

- Don't use class components
- Don't add unnecessary dependencies without discussion
- Don't use inline styles unless absolutely necessary - use StyleSheet.create
- Don't store sensitive data (API keys, credentials) in code
- Don't use `any` type unless absolutely necessary
- Don't over-comment code - prefer self-documenting code with clear naming

## Testing

- Test on both iOS and Android when making UI changes
- Run `npm start` to launch Expo dev server

## Common Commands

```bash
npm start       # Start Expo dev server
npm run android # Run on Android
npm run ios     # Run on iOS
npm run web     # Run on web
```

## Feature Completion Checklist

Before marking a feature complete:

1. Run `npm run format:check` - Verify formatting
2. Run `npm run lint` - No lint errors
3. Run `npx tsc --noEmit` - No type errors
4. Run `npm test -- --coverage` - All tests pass, coverage maintained or improved
5. Add tests for new logic (hooks, utils, services) - Don't decrease coverage %
6. Test on device/simulator - Verify UI works correctly
7. Update ROADMAP.md - Move feature to Completed Features section
8. Commit with descriptive message
