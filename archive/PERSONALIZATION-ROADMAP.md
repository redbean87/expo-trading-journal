# Personalization Features Roadmap

**Vision**: Make the trading journal feel like the user's own personal journal through customization and personalization features.

**Approach**: Implement in 3 small, focused phases to keep PRs manageable and reduce risk.

---

## Overview

| Phase | Feature | Status | Effort | Files Changed |
|-------|---------|--------|--------|---------------|
| 1 | Display Name / Journal Title | 🚧 Ready | 4-6 hrs | 9 files (2 new, 7 modified) |
| 2 | Custom Mistake Categories | ⏸️ Waiting | 12-16 hrs | 12 files (5 new, 7 modified) |
| 3 | Custom Theming (Full Colors) | ⏸️ Waiting | 16-20 hrs | 14 files (6 new, 8 modified) |

**Total Estimated Effort**: 32-42 hours

---

## Phase 1: Display Name / Journal Title

**Status**: 🚧 Ready to implement

**Goal**: Let users name their journal (e.g., "Sarah's Q1 2026 Account")

**Value**: Immediate personalization, visible on home screen

**Details**: See [PHASE-1-DISPLAY-NAME.md](./PHASE-1-DISPLAY-NAME.md)

**Key Changes**:

- New `profile-store.ts` for display name state
- Convex schema + settings for cloud sync
- Home header shows custom name
- Profile screen has editor dialog

**Why First**: Simplest feature, tests the sync architecture, quick win

---

## Phase 2: Custom Mistake Categories

**Status**: ⏸️ Starts after Phase 1 complete

**Goal**: Let users create, edit, delete, and reorder mistake categories

**Value**: Trading styles vary - custom categories are more relevant than hardcoded ones

**Details**: See [PHASE-2-MISTAKE-CATEGORIES.md](./PHASE-2-MISTAKE-CATEGORIES.md)

**Key Changes**:

- New `mistake-categories-store.ts` for CRUD operations
- Category manager UI screen (add/edit/delete/reorder)
- Hook for auto-categorization with custom keywords
- Update trade entry to use custom categories
- Backwards compatible (trades store text, not IDs)

**Why Second**: Medium complexity, builds on Phase 1 sync pattern

---

## Phase 3: Custom Theming (Full Colors)

**Status**: ⏸️ Starts after Phase 2 complete

**Goal**: Let users customize ALL colors (primary, backgrounds, surfaces, profit/loss) for light and dark modes

**Value**: Complete visual personalization, make the app truly feel like "theirs"

**Details**: See [PHASE-3-CUSTOM-THEMING.md](./PHASE-3-CUSTOM-THEMING.md)

**Key Changes**:

- New `custom-theme-store.ts` for color preferences
- `createCustomTheme()` function to merge colors into MD3 theme
- `color-picker.tsx` component for HEX input
- Theme editor UI screen (all color inputs)
- Root layout applies custom theme

**Why Last**: Most complex, affects entire app visually, highest risk

---

## Shared Architecture Pattern

All three phases follow the same architecture:

```
┌─────────────────┐
│ User Interface  │  React components
└────────┬────────┘
         │
┌────────▼────────┐
│ Settings Hook   │  useUpdateDisplayName(), useUpdateCustomTheme(), etc.
└────────┬────────┘
         │
┌────────▼────────┐
│ Zustand Store   │  Local state + AsyncStorage persistence
└────────┬────────┘
         │
┌────────▼────────┐
│ Convex Mutation │  Cloud sync (optimistic updates)
└────────┬────────┘
         │
┌────────▼────────┐
│ SettingsSyncPro │  Real-time sync across devices
│      vider      │
└─────────────────┘
```

**Key Principles**:

- **Local-first**: Update local state immediately (optimistic UI)
- **Cloud sync**: Sync to Convex if authenticated (multi-device)
- **Offline support**: AsyncStorage ensures functionality without network
- **Real-time sync**: Changes propagate across devices instantly
- **Graceful degradation**: Errors logged, user not blocked

---

## Testing Strategy

Each phase includes:

### Unit Tests

- Zustand store tests (persistence, state management)
- Hook tests (validation, error handling)
- Component tests (UI, user interaction)
- Utility tests (parsing, formatting)

### Manual Testing

- Feature functionality (happy path)
- Edge cases (max lengths, invalid input)
- Multi-device sync (two browser windows)
- Offline mode (disconnect, reconnect)
- App restart (persistence)
- Cross-platform (iOS, Android, Web)

### Completion Checklist

- [ ] `npm run format:check` - No issues
- [ ] `npm run lint` - No errors
- [ ] `npx tsc --noEmit` - No type errors
- [ ] `npm test -- --coverage` - All pass, coverage maintained
- [ ] Manual testing complete
- [ ] ROADMAP.md updated
- [ ] PR created and merged

---

## Pull Request Strategy

**Goal**: Keep PRs small, focused, and easy to review

### Phase 1 PR (Display Name)

- **Files**: 9 total (2 new, 7 modified)
- **Scope**: Backend (Convex) + Frontend (UI) + Tests
- **Review Time**: ~30 minutes
- **Can be split into**:
  1. Backend + Store (Convex schema, settings, profile store)
  2. Frontend + Tests (UI components, hooks, tests)

### Phase 2 PR (Mistake Categories)

- **Files**: 12 total (5 new, 7 modified)
- **Scope**: Store + Hook + UI + Tests
- **Review Time**: ~45-60 minutes
- **Can be split into**:
  1. Backend + Store (Convex, store, hook)
  2. UI Components (manager screen, dialogs)
  3. Integration (selector update, sync provider)

### Phase 3 PR (Custom Theming)

- **Files**: 14 total (6 new, 8 modified)
- **Scope**: Theme system + Store + UI + Tests
- **Review Time**: ~60 minutes
- **Can be split into**:
  1. Backend + Store (Convex, store, theme function)
  2. UI Components (color picker, theme editor)
  3. Integration (root layout, sync provider)

---

## Risk Mitigation

### Phase 1 Risks: LOW

- ✅ Isolated feature (only affects home header + profile)
- ✅ No breaking changes (defaults to current behavior)
- ✅ Simple data model (single string field)

### Phase 2 Risks: MEDIUM

- ⚠️ Affects trade entry flow (mistake category selector)
- ✅ Backwards compatible (trades store text, not IDs)
- ✅ Can fall back to defaults if cloud data corrupt

### Phase 3 Risks: MEDIUM-HIGH

- ⚠️ Affects entire app visually (all screens)
- ⚠️ Complex data model (nested object with many colors)
- ⚠️ Potential accessibility issues (low contrast)
- ✅ Can fall back to defaults if invalid
- ✅ Resets are easy (reset to defaults button)

**Mitigation Strategies**:

- Comprehensive testing (unit + manual + cross-platform)
- Graceful error handling (parse errors → defaults)
- Easy reset mechanisms (reset to defaults buttons)
- Progressive rollout (one phase at a time)
- User feedback collection after each phase

---

## Success Metrics

### Completion Metrics

- [ ] All 3 phases implemented and tested
- [ ] All PRs merged to main
- [ ] ROADMAP.md updated
- [ ] Zero regressions in existing features
- [ ] Test coverage maintained or improved

### User Value Metrics (Post-Launch)

- Users setting custom display names (engagement)
- Users creating custom mistake categories (engagement)
- Users customizing theme colors (engagement)
- Multi-device sync working (technical)
- No crashes or errors related to personalization (stability)

---

## Future Enhancements (Post-Phase 3)

Ideas for additional personalization features:

1. **Visual Color Picker** - Replace HEX input with visual picker
2. **Preset Theme Palettes** - Offer curated color schemes
3. **Import/Export Settings** - Share configurations between users
4. **Custom Symbols/Watchlist** - Pin frequently traded symbols
5. **Default Trade Templates** - Pre-fill fields when adding trades
6. **Display Preferences** - Hide/show fields, reorder cards
7. **Goals & Milestones** - Set and track trading goals
8. **Number Formatting** - Currency symbol, decimal places
9. **Note Templates** - Predefined templates for trade notes
10. **Custom Tags** - General-purpose tags beyond mistakes

---

## Questions & Decisions

### Answered

- ✅ **Phasing**: 3 phases (Display Name → Mistake Categories → Theming)
- ✅ **Sync Strategy**: Local-first with cloud sync (Zustand + Convex)
- ✅ **PR Strategy**: Keep small and tidy, can split each phase if needed
- ✅ **Color Input**: HEX text input (visual picker can be added later)
- ✅ **Mistake Category Storage**: Text-based (not IDs) for backwards compatibility

### Open (for later)

- Should default mistake categories be deletable?
- Should there be preset theme palettes?
- Should we add accessibility contrast checking?
- Should we support theme import/export?

---

## Timeline (Tentative)

| Phase | Start | Duration | Complete |
|-------|-------|----------|----------|
| 1 | TBD | 4-6 hours | TBD |
| 2 | After Phase 1 | 12-16 hours | TBD |
| 3 | After Phase 2 | 16-20 hours | TBD |

**Total**: 32-42 hours of implementation + testing + review

---

## Getting Started

Ready to begin? Start with **Phase 1**:

1. Open [PHASE-1-DISPLAY-NAME.md](./PHASE-1-DISPLAY-NAME.md)
2. Begin with Step 1: Create Profile Store
3. Check off items as you complete them
4. Run tests and linting before each commit
5. Create PR when Phase 1 is complete

Let's build something great! 🚀
