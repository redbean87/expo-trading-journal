# Phase 2: Custom Mistake Categories

**Goal**: Let users create, edit, delete, and reorder their own mistake categories (currently 12 hardcoded categories).

**Status**: ⏸️ Waiting (starts after Phase 1 complete)

**Estimated Effort**: 12-16 hours

---

## Overview

Currently, the app has 12 hardcoded mistake categories in `src/constants/mistake-categories.ts`. This phase allows users to:

- Add custom mistake categories
- Edit existing categories (label and keywords)
- Delete categories (except defaults if desired)
- Reorder categories for their preference
- Sync categories across all devices

**Key Design Decision**: Trades store `ruleViolation` as free text (not category IDs), so this change is backwards compatible. Categories are suggestions during trade entry, not hard references.

---

## Implementation Checklist

### Step 1: Define Types

- [ ] Update `src/types/index.ts`
  - [ ] Add `CustomMistakeCategory` type with:
    - `id: string` (UUID)
    - `label: string` (max 50 chars)
    - `keywords: string[]` (for auto-detection, max 10)
    - `isDefault: boolean` (true for built-in categories)
    - `order: number` (for sorting/reordering)
  - [ ] Add `MistakeCategoriesConfig` type with:
    - `categories: CustomMistakeCategory[]`
    - `version: number` (for future migrations)

### Step 2: Create Mistake Categories Store

- [ ] Create `src/store/mistake-categories-store.ts`
  - [ ] Define `MistakeCategoriesStore` type
  - [ ] Implement state: `categories`, `isLoading`
  - [ ] Implement `addCategory()` method (validate max 20 categories)
  - [ ] Implement `updateCategory()` method
  - [ ] Implement `deleteCategory()` method (prevent deleting defaults if desired)
  - [ ] Implement `reorderCategories()` method
  - [ ] Implement `resetToDefaults()` method
  - [ ] Implement `loadCategories()` method
  - [ ] Implement `setFromCloud()` method
  - [ ] Use AsyncStorage key: `@mistake_categories`
  - [ ] Initialize with defaults from `MISTAKE_CATEGORIES` constant

### Step 3: Update Convex Schema

- [ ] Update `convex/schema.ts`
  - [ ] Add `mistakeCategories: v.optional(v.string())` to users table
  - [ ] Will store JSON stringified `MistakeCategoriesConfig`

### Step 4: Update Convex Settings

- [ ] Update `convex/settings.ts`
  - [ ] Add `mistakeCategories: v.optional(v.string())` to updateSettings args
  - [ ] Add validation (parse JSON, validate structure)
  - [ ] Update patch to include mistakeCategories
  - [ ] Return mistakeCategories in getSettings query
  - [ ] Handle JSON parse errors gracefully

### Step 5: Create Mistake Categories Hook

- [ ] Create `src/hooks/use-mistake-categories.ts`
  - [ ] Export `useMistakeCategories()` hook
    - Returns sorted categories (by order)
  - [ ] Export `useAutoCategorizeMistake(text: string)` hook
    - Loop through categories
    - Match keywords against text (case insensitive)
    - Return matching category label or null
  - [ ] Export `useUpdateMistakeCategories()` hook
    - Update local store
    - Sync to cloud if authenticated
    - Handle errors

### Step 6: Update Settings Hooks

- [ ] Update `src/hooks/use-settings.ts`
  - [ ] Add `mistakeCategories: string | null` to CloudSettings type

### Step 7: Update SettingsSyncProvider

- [ ] Update `src/providers/settings-sync-provider.tsx`
  - [ ] Import `useMistakeCategoriesStore`
  - [ ] Subscribe to categories state
  - [ ] Add to migration logic (hasCloudSettings check)
  - [ ] Add to initial upload (stringify and upload)
  - [ ] Add real-time sync (parse JSON, validate, setFromCloud)
  - [ ] Handle parse errors gracefully (fallback to defaults)

### Step 8: Update Mistake Category Selector

- [ ] Update `src/screens/add-trade/mistake-category-selector.tsx`
  - [ ] Replace `MISTAKE_CATEGORIES` import with `useMistakeCategories()` hook
  - [ ] Use custom categories instead of hardcoded ones
  - [ ] Show first 8 categories (excluding "Other") as chips
  - [ ] Keep free-text input functionality
  - [ ] Auto-categorization still works with custom keywords

### Step 9: Create Category Manager Screen

- [ ] Create `src/screens/profile/mistake-categories-manager.tsx`
  - [ ] List all categories with default badges
  - [ ] "Add Category" button (opens dialog)
  - [ ] Tap category to edit (opens dialog)
  - [ ] Delete button (only for non-default, with confirmation)
  - [ ] Reorder functionality (drag handles or up/down buttons)
  - [ ] "Reset to Defaults" button (with confirmation)
  - [ ] Enforce max 20 categories limit
  - [ ] Show category count

- [ ] Create Edit/Add Category Dialog component
  - [ ] TextInput for label (max 50 chars, required)
  - [ ] Chip input for keywords (add/remove, max 10)
  - [ ] Character counter for label
  - [ ] Keyword counter
  - [ ] Save/Cancel buttons
  - [ ] Validation feedback

### Step 10: Update Profile Screen

- [ ] Update `src/screens/profile-screen.tsx`
  - [ ] Add new section: "Customization" or add to existing
  - [ ] Add List.Item: "Manage Mistake Categories"
  - [ ] Description: count of categories (e.g., "12 categories")
  - [ ] Icon: "tag-multiple"
  - [ ] Navigate to category manager screen

### Step 11: Write Unit Tests

- [ ] Create `src/store/__tests__/mistake-categories-store.test.ts`
  - [ ] Test `addCategory()` adds and persists
  - [ ] Test `updateCategory()` updates correctly
  - [ ] Test `deleteCategory()` removes category
  - [ ] Test `reorderCategories()` changes order
  - [ ] Test max 20 categories limit
  - [ ] Test max 50 char label limit
  - [ ] Test max 10 keywords limit
  - [ ] Test `resetToDefaults()` restores defaults
  - [ ] Test `setFromCloud()` updates state

- [ ] Create `src/hooks/__tests__/use-mistake-categories.test.ts`
  - [ ] Test `useAutoCategorizeMistake()` matches keywords
  - [ ] Test case-insensitive matching
  - [ ] Test returns null when no match
  - [ ] Test priority (first match wins)

### Step 12: Manual Testing

- [ ] Add a new custom category
- [ ] Edit category label and keywords
- [ ] Delete a custom category
- [ ] Try to delete a default category (should prevent or warn)
- [ ] Reorder categories (drag or up/down buttons)
- [ ] Test max 20 categories limit enforced
- [ ] Test max 50 char label enforced
- [ ] Test max 10 keywords enforced
- [ ] Test auto-categorization with custom keywords
- [ ] Test reset to defaults
- [ ] Add trade with custom category (free text)
- [ ] Delete category, verify orphaned trade still shows text
- [ ] Test multi-device sync (two browser windows)
- [ ] Test offline mode (add category offline, sync when online)
- [ ] Test app restart (categories persist)

---

## Completion Checklist

Before marking Phase 2 complete:

- [ ] Run `npm run format:check` - No formatting issues
- [ ] Run `npm run lint` - No lint errors
- [ ] Run `npx tsc --noEmit` - No type errors
- [ ] Run `npm test -- --coverage` - All tests pass, coverage maintained
- [ ] Test CRUD operations work correctly
- [ ] Test auto-categorization with custom keywords
- [ ] Test multi-device sync works
- [ ] Test backwards compatibility (existing trades display correctly)
- [ ] Update ROADMAP.md - Move "Custom Mistake Categories" to completed
- [ ] Create pull request with descriptive message
- [ ] Code review and merge

---

## Files Changed

### New Files (4)

- `src/store/mistake-categories-store.ts` - Zustand store for categories
- `src/hooks/use-mistake-categories.ts` - Hook for categories and auto-categorization
- `src/screens/profile/mistake-categories-manager.tsx` - CRUD UI screen
- `src/store/__tests__/mistake-categories-store.test.ts` - Store tests
- `src/hooks/__tests__/use-mistake-categories.test.ts` - Hook tests

### Modified Files (5)

- `src/types/index.ts` - Add CustomMistakeCategory and MistakeCategoriesConfig types
- `src/hooks/use-settings.ts` - Update CloudSettings type
- `src/providers/settings-sync-provider.tsx` - Sync categories
- `src/screens/add-trade/mistake-category-selector.tsx` - Use custom categories
- `src/screens/profile-screen.tsx` - Add navigation to manager
- `convex/schema.ts` - Add mistakeCategories field
- `convex/settings.ts` - Update mutations and queries

---

## Data Model

```typescript
export type CustomMistakeCategory = {
  id: string; // UUID
  label: string; // Max 50 chars
  keywords: string[]; // For auto-detection, max 10
  isDefault: boolean; // True for built-in categories
  order: number; // For sorting/reordering
};

export type MistakeCategoriesConfig = {
  categories: CustomMistakeCategory[];
  version: number; // For future migrations
};
```

**Constraints**:

- Max 20 categories total
- Max 50 characters per label
- Max 10 keywords per category
- Default categories marked with `isDefault: true`

---

## Migration & Backwards Compatibility

**Existing Users**:

- `mistakeCategories: null` in Convex → loads from `MISTAKE_CATEGORIES` constant
- First time user edits categories → uploads to cloud

**Existing Trades**:

- Trades store `ruleViolation` as free text (not category IDs)
- No breaking changes to trade data
- If category deleted, trades still show the text (orphaned but valid)
- Categories are entry helpers, not data constraints

**JSON Parsing**:

- Parse errors → fallback to defaults, log error
- Invalid structure → validate and sanitize
- Missing fields → use sensible defaults

---

## Next Steps

After Phase 2 is complete:

1. Plan Phase 3: Custom Theming
2. Implement Phase 3
