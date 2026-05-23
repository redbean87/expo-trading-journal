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
{
  data.length === 0 ? <EmptyView /> : <ListView data={data} />;
}

// ✅ Prefer
<EmptyState data={data} title="No data" subtitle="Add some data">
  <ListView data={data} />
</EmptyState>;
```

### Theme & Design Tokens

All theme tokens (colors, spacing, borderRadius, elevation, iconSizes) are accessed via `useAppTheme()`. Never import design tokens directly from `'../theme'`.

```typescript
// ✅ Correct
const theme = useAppTheme();
// theme.colors.primary, theme.spacing.lg, theme.borderRadius.md, theme.elevation[2], theme.iconSizes.lg

// ❌ Avoid
import { spacing, borderRadius } from '../theme';
```

**Button hierarchy:**

- `mode="contained"` — primary / affirmative action (one per screen)
- `mode="outlined"` — secondary or destructive action (use error color for destructive)
- `mode="text"` — cancel / dismiss / tertiary

**Color usage hierarchy:**

| Token                | Use For                                                    | Never Use For                                 |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `primary`            | Active tabs, buttons, links, indicators, selection states  | Static titles, body text, decorative elements |
| `onPrimary`          | Text _on_ primary-colored buttons                          | Anywhere else                                 |
| `primaryContainer`   | Selected card bg, active sidebar item bg, selected chip bg | General card backgrounds                      |
| `onPrimaryContainer` | Text on selected/active surfaces, selected chip borders    | Body text on default surfaces                 |
| `onSurface`          | Headings, body text, card titles, section titles           | Selected/active states                        |
| `textSecondary`      | Labels, metadata, inactive tabs, hints, axis labels        | Primary headings                              |
| `textTertiary`       | Empty state descriptions, subtle hints                     | Anything that needs to be readable            |
| `profit`             | Positive P&L numbers, profit bars, win streaks             | Non-trading positive indicators               |
| `loss`               | Negative P&L numbers, loss bars, drawdown                  | Error messages, validation text               |
| `error`              | Validation errors, destructive button text, delete actions | Trading losses                                |
| `background`         | Screen backgrounds                                         | Card backgrounds                              |
| `surface`            | Card backgrounds, modals, input fields                     | Screen backgrounds                            |
| `surfaceVariant`     | Hover states, neutral chart bars, subtle fills             | Primary content areas                         |
| `border`             | Dividers, chart axis lines, card borders                   | Text or interactive elements                  |

**Rules:**

- `primary` is exclusively for interactive/active states. If it's not clickable or selected, don't use `primary`.
- Use `withAlpha(color, alpha)` from `src/utils/color-intensity` for translucent backgrounds. Never concatenate strings like `theme.colors.profit + '20'`.
- `profit` and `loss` are trading semantics only. Use `error` for validation and destructive actions.

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
- **Never commit or push without explicit user approval.** Wait for the user to test changes and confirm "ready to commit" before running git commands. Never assume approval.

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

## Adding a New Trade Field

When adding a new field to the `Trade` model, update the following files to prevent silent data loss:

1. `src/schemas/trade.ts` — Add to `tradeSchema`, `tradeFormSchema`, and `formDataToTrade`
2. `convex/schema.ts` — Add to the `trades` table definition
3. `convex/trades.ts` — Add to query/mutation args, return mappings, and handlers
4. `src/hooks/use-trades.ts` — Add to `BackendTrade`, `mapToTrade`, and `mapFromTrade`
5. `src/services/api-trade-service.ts` — Wire through all API methods
6. `src/screens/add-trade/trade-form.tsx` — Add to the form UI
7. `src/screens/add-trade-screen.tsx` — Include in `initialData` and submit payload
8. `src/components/trade-edit-form.tsx` — Include in edit mode payload
9. Display components — `trade-card.tsx`, `trade-detail-content.tsx`
10. CSV export/import — `csv-export.ts`, `csv-import.ts`
11. Tests — `src/schemas/__tests__/trade.test.ts`

> **Why `use-trades.ts` matters:** The `mapToTrade` and `mapFromTrade` functions are the bridge between the app's `Trade` type and Convex's backend types. If a field is added to the schema but not mapped here, it gets silently dropped on save/load. Prefer spreading the source object (`...trade`) and only explicitly overriding fields that need type transformation (e.g., `entryTime: new Date(...)`). This ensures new fields flow through automatically.

### Changing a Field Type (Enum Conversions)

When converting a field type (e.g., boolean → enum), you must also handle existing data:

1. **Use `v.union()` in Convex schema** for backward compatibility during transition:
   ```typescript
   structureBreakBeforeExit: v.optional(v.union(v.boolean(), v.string()));
   ```
2. **Create a migration mutation** (temporary `internalMutation`) to convert existing data
3. **Run migration** in dev and prod before removing union type
4. **Update all UI components** that reference the old type (e.g., Switch → Chip selector)
5. **Update CSV import/export** to handle new enum values

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
