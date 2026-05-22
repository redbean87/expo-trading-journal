# Phase 1: Display Name / Journal Title

**Goal**: Allow users to set a custom name for their trading journal that displays on the home screen and syncs across devices.

**Status**: 🚧 In Progress

---

## Implementation Checklist

### Step 1: Create Profile Store

- [ ] Create `src/store/profile-store.ts`
  - [ ] Define `ProfileStore` type
  - [ ] Implement `displayName` and `isLoading` state
  - [ ] Implement `setDisplayName()` method with AsyncStorage persistence
  - [ ] Implement `loadProfile()` method
  - [ ] Implement `setFromCloud()` method for sync
  - [ ] Use AsyncStorage key: `@user_profile`
  - [ ] Follow pattern from `theme-store.ts` and `timezone-store.ts`

### Step 2: Update TypeScript Types

- [ ] Update `src/types/index.ts`
  - [ ] Add `UserProfile` type with `displayName: string | null`

### Step 3: Update Convex Schema

- [ ] Update `convex/schema.ts`
  - [ ] Add `displayName: v.optional(v.string())` to users table

### Step 4: Update Convex Settings

- [ ] Update `convex/settings.ts`
  - [ ] Add `displayName: v.optional(v.string())` to updateSettings args
  - [ ] Add validation (max 50 chars)
  - [ ] Update patch to include displayName
  - [ ] Return displayName in getSettings query
  - [ ] Update settingsUpdatedAt timestamp

### Step 5: Update Settings Hooks

- [ ] Update `src/hooks/use-settings.ts`
  - [ ] Add `displayName: string | null` to CloudSettings type
  - [ ] Create `useUpdateDisplayName()` hook
    - [ ] Trim and validate input (max 50 chars)
    - [ ] Update local store first (optimistic)
    - [ ] Sync to cloud if authenticated
    - [ ] Handle errors gracefully

### Step 6: Update SettingsSyncProvider

- [ ] Update `src/providers/settings-sync-provider.tsx`
  - [ ] Import `useProfileStore`
  - [ ] Subscribe to displayName state
  - [ ] Add displayName to migration logic (hasCloudSettings check)
  - [ ] Add displayName to initial upload (updateCloudSettings)
  - [ ] Add real-time sync (setDisplayNameFromCloud)

### Step 7: Update Home Header

- [ ] Update `src/screens/home/home-header.tsx`
  - [ ] Import `useProfileStore`
  - [ ] Get displayName from store
  - [ ] Display: `displayName || 'Trading Journal'`

### Step 8: Update Profile Screen

- [ ] Update `src/screens/profile-screen.tsx`
  - [ ] Add state: `displayNameDialogVisible`, `tempDisplayName`
  - [ ] Import `useProfileStore` and `useUpdateDisplayName()`
  - [ ] Create `handleSaveDisplayName()` function
  - [ ] Create `handleOpenDisplayNameDialog()` function
  - [ ] Add List.Item under Appearance section (after Dark Mode)
    - [ ] Title: "Journal Name"
    - [ ] Description: displayName or default
    - [ ] Icon: "book-edit"
  - [ ] Add Dialog in Portal
    - [ ] TextInput with maxLength={50}
    - [ ] Character counter
    - [ ] Save/Cancel buttons

### Step 9: Write Unit Tests

- [ ] Create `src/store/__tests__/profile-store.test.ts`
  - [ ] Test `setDisplayName()` persists to AsyncStorage
  - [ ] Test `loadProfile()` loads from AsyncStorage
  - [ ] Test max length validation (50 chars)
  - [ ] Test empty string handling (treats as null)
  - [ ] Test `setFromCloud()` updates state

### Step 10: Manual Testing

- [ ] Set display name in profile screen
- [ ] Verify name appears on home screen immediately
- [ ] Test empty name shows "Trading Journal" default
- [ ] Test max 50 characters enforced
- [ ] Test character counter updates correctly
- [ ] Test multi-device sync (two browser windows)
- [ ] Test offline mode (disconnect network, change name, reconnect)
- [ ] Test app restart (close and reopen, name persists)
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on web browser

---

## Completion Checklist

Before marking Phase 1 complete:

- [ ] Run `npm run format:check` - No formatting issues
- [ ] Run `npm run lint` - No lint errors
- [ ] Run `npx tsc --noEmit` - No type errors
- [ ] Run `npm test -- --coverage` - All tests pass, coverage maintained
- [ ] Test on device/simulator - UI works correctly
- [ ] Test multi-device sync - Display name syncs across devices
- [ ] Update ROADMAP.md - Move "Display Name" to completed section
- [ ] Create pull request with descriptive message
- [ ] Code review and merge

---

## Files Changed

### New Files (2)

- `src/store/profile-store.ts` - Zustand store for display name
- `src/store/__tests__/profile-store.test.ts` - Unit tests

### Modified Files (7)

- `src/types/index.ts` - Add UserProfile type
- `src/hooks/use-settings.ts` - Update CloudSettings, add useUpdateDisplayName()
- `src/providers/settings-sync-provider.tsx` - Sync display name
- `src/screens/home/home-header.tsx` - Display custom name
- `src/screens/profile-screen.tsx` - Add editor UI
- `convex/schema.ts` - Add displayName field
- `convex/settings.ts` - Update mutations and queries

---

## Next Steps

After Phase 1 is complete:

1. Plan Phase 2: Custom Mistake Categories
2. Implement Phase 2
3. Plan Phase 3: Custom Theming
4. Implement Phase 3
