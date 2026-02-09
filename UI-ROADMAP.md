# UI/UX Polish Roadmap

This roadmap tracks visual and user experience improvements for the Trading Journal app. Each item should be completed individually to maintain code quality.

---

## In Progress

_None_

---

## High Priority (Immediate Visual Impact)

### 1. Empty States Enhancement

**Impact:** Low effort, improves UX significantly
**Files to modify:**

- `src/components/empty-state.tsx`
- `src/components/card-empty-state.tsx`
- `src/screens/trades-screen.tsx`
- `src/screens/home-screen.tsx`
- `src/screens/analytics/**/*.tsx`

**Tasks:**

- Unify icon sizes (create size tokens: sm: 24, md: 48, lg: 64)
- Add contextual icons to all empty states
- Add CTA buttons to key empty states (trades list, analytics)
- Ensure consistent styling between EmptyState and CardEmptyState
- Add illustrations/graphics to main empty states

**Success Criteria:**

- All empty screens have icons
- Icon sizes are consistent per context
- Trades empty state has "Add Trade" CTA button
- Analytics empty states guide users to add data

---

## Medium Priority (Polish & Consistency)

### 2. Typography System

**Impact:** High effort, establishes design foundation
**Files to modify:**

- `src/theme/index.ts`
- `src/components/stat-card.tsx`
- `src/components/trade-card.tsx`
- All analytics cards

**Tasks:**

- Extend MD3 theme with custom typography variants
- Define value display typography (P&L, stats)
- Standardize meta text styling
- Create typography hierarchy (display, headline, title, body, caption)
- Update all text components to use new variants

**Success Criteria:**

- Typography variants defined in theme
- All P&L displays use consistent styling
- No direct text style overrides (all via theme)

---

### 3. Skeleton Loading States

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

### 4. Form Input Standardization

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

### 5. Button Hierarchy & Patterns

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

### 6. Standardize Theme Access Pattern

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

### 7. Micro-interactions & Animations

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

### 8. Trade Card Improvements

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

### 9. Responsive Design Polish

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

### 1. Standardize Spacing Tokens ✓

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

### 2. Enhance Card Visual Hierarchy ✓

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

### 3. Empty States Enhancement ✓

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

_Last updated: February 2026_
_Next review: After completing item #1 or #6_
