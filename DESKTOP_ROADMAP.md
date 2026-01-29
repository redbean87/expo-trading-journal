# Desktop Support Roadmap

Track progress on desktop support implementation. Check off each chunk as completed.

---

## Phase 1: Responsive Foundation

- [x] **1.1 Breakpoint Hook** *(Start here)*
  - Create `src/hooks/use-breakpoint.ts`
  - Breakpoints: mobile (<768), tablet (768-1023), desktop (1024+)
  - Returns `{ breakpoint, isMobile, isTablet, isDesktop, width }`

- [x] **1.2 Responsive Container**
  - Create `src/components/responsive-container.tsx`
  - Applies `maxWidth: 1200px` on desktop, centers content

- [x] **1.3 Responsive Grid**
  - Create `src/components/responsive-grid.tsx`
  - Configurable columns: `columns={{ mobile: 1, tablet: 2, desktop: 4 }}`

- [x] **1.4 Theme Spacing Constants**
  - Extend `src/theme/index.ts`
  - Add `spacing` and `layout` constants

---

## Phase 2: Navigation Adaptation

- [x] **2.1 Navigation Mode Hook**
  - Create `src/hooks/use-navigation-mode.ts`
  - Returns `'tabs' | 'sidebar'` based on breakpoint

- [x] **2.2 Desktop Sidebar**
  - Create `src/components/desktop-sidebar.tsx`
  - Vertical nav with icons + labels, highlights active route

- [x] **2.3 Adaptive Layout Wrapper**
  - Modify `app/(tabs)/_layout.tsx`
  - Bottom tabs on mobile/tablet, sidebar on desktop

- [x] **2.4 Persistent Sidebar for Detail Screens**
  - Move sidebar logic from `(tabs)/_layout.tsx` to `_layout.tsx`
  - Sidebar persists on trade detail, add/edit trade screens
  - Files: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`

---

## Phase 3: Screen Layouts

- [x] **3.1 Home Screen**
  - Wrap in `ResponsiveContainer`
  - Stat cards: 2 cols mobile → 4 cols desktop
  - Files: `home-screen.tsx`, `stat-card.tsx`

- [x] **3.2 Trades Screen**
  - Wrap in `ResponsiveContainer`
  - Constrain trade card width, adjust FAB positioning
  - File: `trades-screen.tsx`

- [x] **3.3 Analytics Screen**
  - Wrap in `ResponsiveContainer`
  - 2-column grid for overview cards on desktop
  - Files: `analytics-screen.tsx`, `overview-section.tsx`

- [x] **3.4 Profile Screen**
  - Wrap in `ResponsiveContainer`
  - Constrain settings cards (max 600px)
  - File: `profile-screen.tsx`

- [x] **3.5 Trade Form**
  - Constrain form width (max 600px, centered)
  - Files: `trade-form.tsx`, `trade-form-content.tsx`

---

## Phase 4: Chart Improvements

- [x] **4.1 Chart Width Utilities**
  - Create `src/utils/chart-dimensions.ts`
  - Centralize width calculations

- [x] **4.2 Equity Curve Enhancement**
  - Use utility, increase height on desktop
  - File: `equity-curve-card.tsx`

- [x] **4.3 Calendar & Bar Charts**
  - Larger calendar cells, max width constraints
  - Files: `calendar-grid.tsx`, `day-of-week-card.tsx`, `time-of-day-card.tsx`

---

## Phase 5: Input Improvements

- [x] **5.1 Hover States**
  - Add hover styles to `TradeCard`
  - File: `trade-card.tsx`

- [ ] **5.2 Keyboard Shortcuts**
  - Create `src/hooks/use-keyboard-shortcuts.ts`
  - `Ctrl/Cmd + N`: New trade, `Escape`: Close modals

- [ ] **5.3 Form Tab Navigation**
  - Proper `tabIndex` ordering, `returnKeyType="next"` chaining
  - File: `trade-form.tsx`

---

## Phase 6: Polish

- [ ] **6.1 Empty States**
  - Larger illustrations on desktop
  - File: `empty-state.tsx`

- [ ] **6.2 Loading States**
  - Centered, appropriate sizing
  - File: `loading-state.tsx`

---

## Dependencies

```
1.1 ─┬─> 1.2 ─┐
     ├─> 1.3 ─┼─> Phase 3 (all screens)
     ├─> 2.1 ─> 2.2 ─> 2.3 ─> 2.4
     └─> 4.1 ─> 4.2, 4.3

1.4 (independent)
Phase 5 (independent)
Phase 6 (after Phase 3)
```

---

## Verification Checklist (run per chunk)

```bash
npm run web          # Test in browser at different widths
npm run lint         # No lint errors
npx tsc --noEmit     # No type errors
npm test             # All tests pass
```

Test breakpoints:
- Mobile: < 768px
- Tablet: 768-1023px
- Desktop: 1024px+
