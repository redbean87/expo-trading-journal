# UX Improvements Backlog

## Active Items

### 1. Remove Header

- **Status**: Not started
- **Priority**: High (quick win)
- **Notes**: Remove Expo Router Stack header from all screens for mobile. Currently takes ~56px of screen real estate. Can hide globally and add custom headers only where needed.
- **Files**: `app/_layout.tsx` (Stack screenOptions), potentially add custom headers to specific screens

### 2. Time Selection Across All Pages

- **Status**: Not started
- **Priority**: High
- **Notes**: Make time period filter (Today/Week/Month/Year/All) consistent across Home, Trades list, and Analytics pages. Currently only Home has this.
- **Approach**: Create global time filter in Zustand store. All pages subscribe to same state. Selection persists when navigating between pages.
- **Files**:
  - Create: `src/store/time-filter-store.ts`
  - Update: `src/screens/home/home-screen.tsx`, `src/screens/trades-screen.tsx`, analytics screens

### 3. Default Time Selection (User Setting)

- **Status**: Not started
- **Priority**: Medium
- **Notes**: Allow user to set their preferred default time period in settings. Save to Convex user profile.
- **Default**: "Week" (common trading view)
- **Files**:
  - `convex/schema.ts` (add defaultTimePeriod to users table)
  - `src/screens/profile/settings-screen.tsx` (add dropdown/select)
  - `src/store/time-filter-store.ts` (read default on init)

### 4. Fix Modal Width on Mobile

- **Status**: Not started
- **Priority**: High (bug fix)
- **Notes**: Theme color picker modal and possibly others span full width on mobile. Need maxWidth constraint.
- **Fix**: Add `maxWidth` and `alignSelf: 'center'` to modal containers.
- **Files**: Check `src/screens/profile/custom-theme-screen.tsx` or wherever theme picker modal is defined

### 5. Theme Breakdown + Secondary Color

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

### 6. Migrate Prod Data to Dev

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

---

## Next Steps

Ready to implement Phase 1 items:

1. Remove header
2. Fix modal width
3. Default time selection setting

Then Phase 2: 4. Global time filter across pages 5. Prod-to-dev migration script

Phase 3 (future): 6. Theme audit and secondary color
