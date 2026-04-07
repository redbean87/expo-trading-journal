# UI/UX Polish Roadmap

This roadmap tracks visual and user experience improvements for the Trading Journal app. Each item should be completed individually to maintain code quality.

---

## In Progress

_None_

---

## High Priority (Immediate Visual Impact)

_None_

---

## Medium Priority (Polish & Consistency)

### 1. Skeleton Loading States _(skipped — not wanted)_

_All other medium priority and enhancement items completed April 2026. See Completed section._

**Impact:** Medium effort, improves perceived performance
**Files to create:**

- `src/components/skeleton.tsx` (reusable skeleton)
- `src/components/skeleton-card.tsx`

**Files to modify:**

- `src/components/loading-state.tsx`
- `src/screens/home-screen.tsx`
- `src/screens/trades-screen.tsx`

**Tasks:**

- Create reusable skeleton component with shimmer animation
- Build skeleton variants (text, card, stat)
- Replace spinners with skeleton screens
- Add progressive loading (show skeleton while data loads)

**Success Criteria:**

- Skeleton screens replace spinners
- Shimmer animation works on all platforms
- Skeleton layout matches actual content layout

---

### 2. Form Input Standardization

**Impact:** Medium effort, improves form UX
**Files to create:**

- `src/components/form-layout.tsx` (standardized form container)

**Files to modify:**

- `src/screens/add-trade-screen.tsx`
- `src/screens/profile-screen.tsx`
- All form components

**Tasks:**

- Create standardized form layout component
- Standardize all inputs to `mode="outlined"`
- Consistent input spacing and grouping
- Add form section dividers
- Standardize label placement and styling

**Success Criteria:**

- All forms use consistent layout
- Input spacing is uniform
- Labels and helper text are styled consistently

---

### 3. Button Hierarchy & Patterns

**Impact:** Low effort, improves action clarity
**Files to modify:**

- All screens with actions
- `src/screens/trades-screen.tsx` (FAB actions)
- `src/screens/profile-screen.tsx`
- `src/screens/trade-detail-screen.tsx`

**Tasks:**

- Define button hierarchy rules (primary, secondary, tertiary, danger)
- Apply consistent button styles across app
- Enhance destructive actions (delete, clear) with confirmation styling
- Standardize FAB and action button placement
- Add icon consistency to action buttons

**Success Criteria:**

- Button hierarchy is visually clear
- Destructive actions use consistent styling
- All action buttons have appropriate icons

---

### 4. Standardize Theme Access Pattern

**Impact:** Medium effort, improves code consistency and maintainability
**Files to modify:**

- `src/theme/index.ts` (extend theme or create unified hook)
- All component and screen files (40+ files)

**Tasks:**

- Unify theme token access pattern (currently inconsistent)
- Current: Colors via `useAppTheme()`, spacing via direct `spacing` import
- Target: Single consistent access pattern
- Options:
  1. Extend `useAppTheme()` to return spacing/borderRadius: `theme.spacing.lg`
  2. Create unified hook: `const { colors, spacing } = useDesignSystem()`
- Update all imports and usage patterns
- Document the chosen pattern

**Success Criteria:**

- All theme tokens accessed via single pattern
- No mixing of `useAppTheme()` + direct `spacing` imports
- Clear documentation in CLAUDE.md
- TypeScript types properly exported

---

## Enhancements (Nice to Have)

### 1. Micro-interactions & Animations

**Impact:** Medium effort, delightful UX
**Files to modify:**

- `src/components/trade-card.tsx`
- `src/components/stat-card.tsx`
- `src/screens/home-screen.tsx`
- Navigation transitions

**Tasks:**

- Add scale animation on card press
- Animate stat value changes
- Smooth FAB action expansion/collapse
- Add transition animations between screens
- Implement pull-to-refresh animation enhancement

**Success Criteria:**

- Cards have subtle press feedback
- Value changes animate smoothly
- Navigation feels fluid

---

### 2. Trade Card Improvements

**Impact:** Medium effort, improves list usability
**Files to create:**

- `src/components/swipeable-trade-card.tsx` (optional)

**Files to modify:**

- `src/components/trade-card.tsx`
- `src/screens/trades-screen.tsx`

**Tasks:**

- Implement swipe actions for quick edit/delete
- Enhance P&L display prominence
- Convert strategy text to Chip component
- Add long-press for multi-select (future feature)
- Improve card information density

**Success Criteria:**

- Swipe actions work smoothly
- P&L is visually prominent
- Strategy tags use Chip component
- Cards feel more actionable

---

### 3. Responsive Design Polish

**Impact:** Medium effort, improves tablet experience
**Files to modify:**

- `src/screens/analytics/**/*.tsx`
- `src/components/responsive-grid.tsx`
- `src/screens/home-screen.tsx`

**Tasks:**

- Optimize tablet layouts (768px-1023px)
- Add landscape mobile optimizations
- Create wide desktop layouts (>1200px)
- Improve master-detail view proportions
- Add responsive typography scaling

**Success Criteria:**

- Tablet layout feels optimized
- Landscape mode works well
- Wide screens use space efficiently

---

## Completed

### 1. Typography System ✓

**Completed:** March 2026
**Files modified:**

- `src/theme/index.ts` - Extended MD3 theme with custom typography variants
- Text components updated to use new variants

**Summary:** Extended the MD3 theme with custom typography variants for value display (P&L, stats), meta text, and a full hierarchy (display, headline, title, body, caption). Resolved TypeScript errors for custom Text variants.

---

### 2. Standardize Spacing Tokens ✓

**Completed:** February 2026
**Files modified:**

- `src/screens/home-screen.tsx` - 2 spacing tokens
- `src/screens/trades-screen.tsx` - 11 spacing tokens
- `src/screens/profile-screen.tsx` - 7 spacing tokens
- `src/components/stat-card.tsx` - 1 spacing token
- `src/components/trade-card.tsx` - 5 spacing tokens
- `src/theme/index.ts` - Added borderRadius tokens

**Summary:** Replaced 26 hardcoded spacing values with theme tokens. Added borderRadius design tokens (sm: 4, md: 8, lg: 12, xl: 16, xxl: 24). All imports follow project conventions.

---

### 3. Enhance Card Visual Hierarchy ✓

**Completed:** February 2026
**Files modified:**

- `src/theme/index.ts` - Added elevation tokens (levels 0-3)
- `src/components/stat-card.tsx` - Elevation level 1, borderRadius
- `src/components/trade-card.tsx` - Elevation, selected border, hover animation
- `src/components/section-card.tsx` - Elevation, spacing tokens, borderRadius

**Summary:**

- Created elevation design system with 4 levels
- Stat cards: subtle elevation (level 1), 8px border radius
- Trade cards: elevation (level 2), 2px primary border when selected, spring scale animation (1.02) on press
- Section cards: elevation (level 2), spacing.lg, 8px border radius

---

### 4. Empty States Enhancement ✓

**Completed:** February 2026
**Files modified:**

- `src/theme/index.ts` - Added `iconSizes` tokens (sm: 24, md: 48, lg: 64)
- `src/components/empty-state.tsx` - Added icon size tokens, CTA action prop, consistent styling
- `src/components/card-empty-state.tsx` - Added icon size tokens, CTA action prop, consistent styling
- `src/screens/trades-screen.tsx` - Added icon and "Add Trade" CTA button to empty state
- `src/screens/home/recent-trades-card.tsx` - Added CTA button to empty state

**Summary:**

- Created icon size design system with 3 levels (sm: 24 for cards, lg: 64 for full-page)
- EmptyState component now supports optional CTA action with button
- CardEmptyState component now supports optional CTA action with outlined button
- Trades screen empty state shows chart icon and prominent "Add Trade" button
- Recent trades card shows CTA button when no trades exist
- All analytics cards already had appropriate contextual icons
- All empty states now use consistent spacing tokens
- All success criteria met per roadmap requirements

---

## Working Notes

### Theme Token Additions Needed

```typescript
// Add to src/theme/index.ts
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

export const iconSizes = {
  sm: 24,
  md: 48,
  lg: 64,
} as const;

export const elevation = {
  0: { elevation: 0, shadowOpacity: 0 },
  1: { elevation: 1, shadowOpacity: 0.1 },
  2: { elevation: 2, shadowOpacity: 0.15 },
  3: { elevation: 4, shadowOpacity: 0.2 },
  4: { elevation: 8, shadowOpacity: 0.25 },
} as const;
```

### Spacing Audit Checklist

- [x] `home-screen.tsx` - padding: 16 → theme.spacing.lg
- [x] `trades-screen.tsx` - padding: 16 → theme.spacing.lg
- [x] `trades-screen.tsx` - marginBottom: 12 → theme.spacing.md
- [x] `profile-screen.tsx` - padding: 16 → theme.spacing.lg
- [x] `profile-screen.tsx` - marginBottom: 16 → theme.spacing.lg
- [x] `stat-card.tsx` - marginTop: 8 → theme.spacing.sm
- [x] `trade-card.tsx` - marginBottom: 12 → theme.spacing.md
- [x] `trade-card.tsx` - marginTop: 4/8 → theme.spacing.xs/sm

---

---

### 5. Standardize Theme Access Pattern ✓

**Completed:** April 2026
**Files modified:**

- `src/theme/index.ts` - Added spacing/borderRadius/elevation/iconSizes to theme object via `designTokens`
- 14 component and screen files - Removed direct token imports, use `theme.spacing`, `theme.borderRadius`, etc.
- `CLAUDE.md` - Documented canonical pattern and button hierarchy

**Summary:** Extended `lightTheme`/`darkTheme` with design token objects so `useAppTheme()` returns all tokens. Eliminated all direct `import { spacing } from '../theme'` patterns across the codebase. Single access pattern throughout.

---

### 6. Form Input Standardization ✓

**Completed:** April 2026
**Files created:**

- `src/components/form-layout.tsx` - Section container with title, consistent spacing, and dividers

**Files modified:**

- `src/screens/add-trade/trade-form.tsx` - Grouped into 4 sections: Trade Details, Timing, Fees, Psychology & Notes
- `src/screens/add-trade/trade-form-content.tsx` - Converted hardcoded spacing to theme tokens

**Summary:** Created FormLayout component with optional section title and divider. Applied to add-trade form with logical field grouping. All inputs use `mode="outlined"` consistently.

---

### 7. Button Hierarchy & Patterns ✓

**Completed:** April 2026

**Summary:** Documented hierarchy in CLAUDE.md: `contained` = primary, `outlined` = secondary/destructive, `text` = cancel/tertiary. Verified existing screens already follow the pattern consistently.

---

### 8. Micro-interactions & Animations ✓

**Completed:** April 2026
**Files modified:**

- `src/screens/trades-screen.tsx` - FAB menu animates in/out (opacity + translateY slide-up, 200ms). FAB icon rotates 45° when open.
- `src/components/stat-card.tsx` - Added optional `onPress` with spring scale animation (0.97)

**Summary:** FAB expansion now animates smoothly instead of abruptly appearing. StatCard supports tappable states with subtle press feedback.

---

### 9. Trade Card Improvements ✓

**Completed:** April 2026
**Files modified:**

- `src/components/trade-card.tsx` - Strategy text → compact Chip tag; P&L upgraded from `titleLarge` to `headlineSmall`

**Summary:** Strategy field now renders as a Chip tag for clearer visual hierarchy. P&L figure is more prominent with a larger type variant.

---

### 10. Responsive Design Polish ✓

**Completed:** April 2026
**Files modified:**

- `src/screens/analytics/charts-section.tsx` - Daily P&L and Calendar charts render side-by-side on tablet and desktop
- `src/components/responsive-container.tsx` - Max-width increased from 1200 to 1440
- `src/hooks/use-content-width.ts` - Updated max-width constant to match
- `src/theme/index.ts` - Updated `layout.container.maxWidth` to 1440

**Summary:** Analytics charts tab shows 2-up layout on wider screens. Content areas use more space on wide monitors.

---

Last updated: April 2026
