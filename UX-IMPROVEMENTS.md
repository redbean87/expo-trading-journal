# UX Improvements Backlog

## Active Items

### 1. Time Selection Across All Pages

- **Status**: Completed
- **Priority**: High
- **Notes**: Global time period filter (Today/Week/Month/Year/All) now consistent across Home, Trades list, and Analytics pages. Selection persists via AsyncStorage and syncs across all pages.
- **Files**:
  - Created: `src/store/time-filter-store.ts`
  - Created: `src/components/time-filter-selector.tsx`
  - Updated: `src/screens/home/home-screen.tsx` (replaced local state with global store)
  - Updated: `src/screens/trades-screen.tsx` (added filter UI + integrated with `useTradeFilters`)
  - Updated: `src/screens/analytics-layout.tsx` (switched to global store)
  - Updated: `src/store/analytics-store.ts` (removed local `selectedRange`, re-exports global store)
  - Updated: `src/hooks/use-home-summary.ts` (accepts `DateRangePreset` instead of `HomePeriod`)
  - Updated: `src/hooks/use-trade-filters.ts` (accepts optional `timeRangeStart`)
  - Updated: `app/_layout.tsx` (initialized store on app launch)

### 2. Default Time Selection (User Setting)

- **Status**: Not started
- **Priority**: Medium
- **Notes**: Allow user to set their preferred default time period in settings. Save to Convex user profile.
- **Default**: "Week" (common trading view)
- **Files**:
  - `convex/schema.ts` (add defaultTimePeriod to users table)
  - `src/screens/profile/settings-screen.tsx` (add dropdown/select)
  - `src/store/time-filter-store.ts` (read default on init)

### 3. Theme Breakdown + Secondary Color

- **Status**: Not started
- **Priority**: Low (nice to have)
- **Notes**:
  - **Audit**: Map where each theme color token is used (primary, surface, background, etc.)
  - **Secondary Color**: Add a secondary accent color to custom theme system for more visual variety
- **Files**:
  - Audit: Search all `theme.colors.*` usage across app
  - `src/theme/` (theme configuration)
  - `src/screens/profile/custom-theme-screen.tsx` (add secondary color picker)
  - `convex/schema.ts` (add secondary color to customColors)

### 4. Migrate Prod Data to Dev

- **Status**: Not started
- **Priority**: Medium
- **Notes**: Periodic script to copy production trades to dev environment for testing with real data.
- **Frequency**: Manual script (run weekly or as needed)
- **Approach**:
  - Export from prod via Convex CLI
  - Import to dev via Convex CLI
  - Or create internal function that fetches from prod and writes to dev
- **Files**:
  - Create: `scripts/migrate-prod-to-dev.ts` or `convex/trades.ts` internal function

---

## Completed Items

- [x] Setup Quality rename (confidence → setupQuality)
- [x] Structure Break Before Exit field
- [x] Would Take Trade Again field
- [x] Stop Loss field
- [x] Update documentation (README, ROADMAP, CLAUDE, ChatGPT prompt)
- [x] **Remove Header** — Hidden globally via `headerShown: false` in all layouts (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/trades/_layout.tsx`, analytics layout). Verified complete.
- [x] **Fix Modal Width on Mobile** — All Dialog/Portal components already have `maxWidth: 600`, `alignSelf: 'center'`, and `width: '90%'` constraints. Verified in: custom-colors, date-range-picker, position-sizing, date-picker, timezone-picker, tag-selector, trade-detail, trades import, profile dialogs, trade-filter. Verified complete.

---

## Next Steps

Ready to implement Phase 1 items:

1. Global time filter across pages (was #2)
2. Default time selection setting (was #3)

Then Phase 2: 3. Prod-to-dev migration script (was #6)

Phase 3 (future): 4. Theme audit and secondary color (was #5)
