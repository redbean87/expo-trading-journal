# Phase 3: Custom Theming (Full Colors)

**Goal**: Let users customize ALL colors (primary, backgrounds, surfaces, profit/loss) for both light and dark modes.

**Status**: ⏸️ Waiting (starts after Phase 2 complete)

**Estimated Effort**: 16-20 hours

---

## Overview

Currently, the app supports light/dark mode toggle with hardcoded colors. This phase allows users to:

- Customize primary accent color
- Customize light mode colors (background, surface, text, border)
- Customize dark mode colors (background, surface, text, border)
- Customize trading-specific colors (profit, loss)
- Reset to default theme
- Sync theme across all devices

**Key Design Decision**: Users edit HEX color codes directly (simple, cross-platform). Visual color picker can be added later.

---

## Implementation Checklist

### Step 1: Define Types

- [ ] Update `src/types/index.ts`
  - [ ] Add `CustomColors` type with:
    - `primary: string` (accent color)
    - `light: { background, surface, surfaceVariant, text, textSecondary, border }`
    - `dark: { background, surface, surfaceVariant, text, textSecondary, border }`
    - `profit: string`
    - `loss: string`
  - [ ] Add `CustomThemePreset` type: `'default' | 'custom'`

### Step 2: Extract Default Colors

- [ ] Update `src/theme/index.ts`
  - [ ] Export `DEFAULT_CUSTOM_COLORS` constant
  - [ ] Extract current theme colors as defaults
  - [ ] Ensure all colors are HEX format (#RRGGBB)

### Step 3: Create Custom Theme Store

- [ ] Create `src/store/custom-theme-store.ts`
  - [ ] Define `CustomThemeStore` type
  - [ ] Implement state: `preset`, `customColors`, `isLoading`
  - [ ] Implement `setPreset()` method
  - [ ] Implement `setCustomColors()` method (validate HEX format)
  - [ ] Implement `resetToDefaults()` method
  - [ ] Implement `loadCustomTheme()` method
  - [ ] Implement `setFromCloud()` method
  - [ ] Use AsyncStorage key: `@custom_theme`
  - [ ] Default: preset='default', customColors=null

### Step 4: Update Convex Schema

- [ ] Update `convex/schema.ts`
  - [ ] Add `customThemePreset: v.optional(v.string())` to users table
  - [ ] Add `customColors: v.optional(v.string())` to users table
  - [ ] Will store JSON stringified `CustomColors`

### Step 5: Update Convex Settings

- [ ] Update `convex/settings.ts`
  - [ ] Add `customThemePreset` and `customColors` to updateSettings args
  - [ ] Add validation (parse JSON, validate HEX format)
  - [ ] Update patch to include custom theme fields
  - [ ] Return custom theme fields in getSettings query
  - [ ] Handle JSON parse errors gracefully

### Step 6: Create Theme Merging Function

- [ ] Update `src/theme/index.ts`
  - [ ] Create `createCustomTheme()` function
    - Takes baseTheme, customColors, and mode
    - If customColors is null, return baseTheme
    - Merge custom colors into MD3 theme structure
    - Return AppTheme with custom colors applied
  - [ ] Export function for use in _layout

### Step 7: Update Root Layout

- [ ] Update `app/_layout.tsx`
  - [ ] Import `useCustomThemeStore` and `createCustomTheme`
  - [ ] Load custom theme on mount (call `loadCustomTheme()`)
  - [ ] Get preset and customColors from store
  - [ ] Apply custom theme:

    ```typescript
    const baseTheme = themeMode === 'dark' ? darkTheme : lightTheme;
    const paperTheme = preset === 'custom'
      ? createCustomTheme(baseTheme, customColors, themeMode)
      : baseTheme;
    ```

  - [ ] Pass to PaperProvider

### Step 8: Update Settings Hooks

- [ ] Update `src/hooks/use-settings.ts`
  - [ ] Add `customThemePreset` and `customColors` to CloudSettings type
  - [ ] Create `useUpdateCustomTheme()` hook
    - Validate HEX format for all colors
    - Update local store (optimistic)
    - Stringify and sync to cloud if authenticated
    - Handle errors gracefully

### Step 9: Update SettingsSyncProvider

- [ ] Update `src/providers/settings-sync-provider.tsx`
  - [ ] Import `useCustomThemeStore`
  - [ ] Subscribe to preset and customColors state
  - [ ] Add to migration logic (include custom theme)
  - [ ] Add to initial upload (stringify customColors)
  - [ ] Add real-time sync (parse JSON, validate, setFromCloud)
  - [ ] Handle parse errors (fallback to defaults)

### Step 10: Create Color Picker Component

- [ ] Create `src/components/color-picker.tsx`
  - [ ] Props: `label`, `value`, `onChange`, `error?`
  - [ ] TextInput for HEX code (#RRGGBB)
  - [ ] Color preview swatch (colored box)
  - [ ] Validate HEX format on change
  - [ ] Show error message if invalid
  - [ ] Max length: 7 characters (#RRGGBB)
  - [ ] Auto-format: add # if missing, uppercase

### Step 11: Create Theme Editor Screen

- [ ] Create `src/screens/profile/custom-theme-editor.tsx`
  - [ ] ScrollView with sections:
    - "Primary Color" - 1 ColorPicker
    - "Light Mode Colors" - 6 ColorPickers
    - "Dark Mode Colors" - 6 ColorPickers
    - "Trading Colors" - 2 ColorPickers (profit, loss)
  - [ ] "Reset to Defaults" button (with confirmation)
  - [ ] "Save" button (validate all, then save)
  - [ ] Show validation errors
  - [ ] Preview mode (show sample components with colors)
  - [ ] Loading state while saving

### Step 12: Update Profile Screen

- [ ] Update `src/screens/profile-screen.tsx`
  - [ ] Add List.Item under Appearance section
  - [ ] Title: "Customize Colors"
  - [ ] Description: "Custom" or "Default"
  - [ ] Icon: "palette"
  - [ ] Navigate to theme editor screen

### Step 13: Write Unit Tests

- [ ] Create `src/store/__tests__/custom-theme-store.test.ts`
  - [ ] Test `setCustomColors()` validates and persists
  - [ ] Test `setPreset()` changes preset
  - [ ] Test `resetToDefaults()` clears custom colors
  - [ ] Test `loadCustomTheme()` loads from storage
  - [ ] Test `setFromCloud()` updates state
  - [ ] Test HEX validation (reject invalid formats)
  - [ ] Test JSON serialization/deserialization

- [ ] Create `src/theme/__tests__/custom-theme.test.ts`
  - [ ] Test `createCustomTheme()` merges colors correctly
  - [ ] Test null customColors returns baseTheme
  - [ ] Test light mode uses light colors
  - [ ] Test dark mode uses dark colors
  - [ ] Test custom colors override defaults

- [ ] Create `src/components/__tests__/color-picker.test.tsx`
  - [ ] Test HEX input validation
  - [ ] Test auto-formatting (add #, uppercase)
  - [ ] Test onChange callback
  - [ ] Test error display
  - [ ] Test max length enforcement

### Step 14: Manual Testing

- [ ] Open theme editor
- [ ] Change primary color → see immediate effect
- [ ] Change light mode background → verify in light mode
- [ ] Change dark mode background → verify in dark mode
- [ ] Toggle light/dark → custom colors preserved
- [ ] Change profit/loss colors → verify in trades list
- [ ] Test invalid HEX codes → show error, prevent save
- [ ] Test reset to defaults → colors revert
- [ ] Test save → colors persist on app restart
- [ ] Test multi-device sync (two browser windows)
- [ ] Test offline mode (change colors offline, sync when online)
- [ ] Test accessibility (text contrast warnings)
- [ ] Test on iOS, Android, Web

---

## Completion Checklist

Before marking Phase 3 complete:

- [ ] Run `npm run format:check` - No formatting issues
- [ ] Run `npm run lint` - No lint errors
- [ ] Run `npx tsc --noEmit` - No type errors
- [ ] Run `npm test -- --coverage` - All tests pass, coverage maintained
- [ ] Test color changes apply immediately
- [ ] Test light/dark mode switching preserves custom colors
- [ ] Test reset to defaults works
- [ ] Test multi-device sync works
- [ ] Test on iOS, Android, Web (color picker, validation)
- [ ] Consider accessibility (warn about low contrast)
- [ ] Update ROADMAP.md - Move "Custom Theming" to completed
- [ ] Create pull request with descriptive message
- [ ] Code review and merge

---

## Files Changed

### New Files (5)

- `src/store/custom-theme-store.ts` - Zustand store for custom theme
- `src/components/color-picker.tsx` - HEX color input component
- `src/screens/profile/custom-theme-editor.tsx` - Theme editor UI
- `src/store/__tests__/custom-theme-store.test.ts` - Store tests
- `src/theme/__tests__/custom-theme.test.ts` - Theme merging tests
- `src/components/__tests__/color-picker.test.tsx` - Component tests

### Modified Files (6)

- `src/types/index.ts` - Add CustomColors and CustomThemePreset types
- `src/theme/index.ts` - Add createCustomTheme() and DEFAULT_CUSTOM_COLORS
- `app/_layout.tsx` - Load and apply custom theme
- `src/hooks/use-settings.ts` - Update CloudSettings, add useUpdateCustomTheme()
- `src/providers/settings-sync-provider.tsx` - Sync custom theme
- `src/screens/profile-screen.tsx` - Add navigation to theme editor
- `convex/schema.ts` - Add custom theme fields
- `convex/settings.ts` - Update mutations and queries

---

## Data Model

```typescript
export type CustomColors = {
  primary: string; // Accent color (#RRGGBB)

  light: {
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
  };

  dark: {
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
  };

  profit: string; // Green (#4caf50 default)
  loss: string;   // Red (#f44336 default)
};

export type CustomThemePreset = 'default' | 'custom';
```

**Validation**:

- All colors must be valid HEX format: `#RRGGBB`
- 6-digit hex (no alpha channel for simplicity)
- Case-insensitive, but stored as uppercase
- Auto-add # if missing

---

## Theme Merging Logic

```typescript
export function createCustomTheme(
  baseTheme: typeof lightTheme | typeof darkTheme,
  customColors: CustomColors | null,
  mode: ThemeMode
): AppTheme {
  if (!customColors) return baseTheme;

  const modeColors = mode === 'light' ? customColors.light : customColors.dark;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: customColors.primary,
      background: modeColors.background,
      surface: modeColors.surface,
      surfaceVariant: modeColors.surfaceVariant,
      onSurface: modeColors.text,
      onSurfaceVariant: modeColors.textSecondary,
      outline: modeColors.border,
      profit: customColors.profit,
      loss: customColors.loss,
      textSecondary: modeColors.textSecondary,
    },
  };
}
```

---

## Migration & Validation

**Existing Users**:

- `customThemePreset: null` → use 'default'
- `customColors: null` → no custom colors, use theme defaults
- First time user customizes → uploads to cloud

**Validation**:

- HEX format: `/^#[0-9A-F]{6}$/i`
- Enforce in UI (ColorPicker) and backend (Convex mutation)
- Invalid color → show error, prevent save
- Missing color in object → merge with defaults

**JSON Parsing**:

- Parse errors → fallback to defaults, log error
- Invalid structure → use defaults
- Graceful degradation throughout

**Accessibility**:

- Optional: Warn if text/background contrast ratio < 4.5:1 (WCAG AA)
- Don't prevent saving (user preference)
- Could add "Check Accessibility" button

---

## Design Decisions

**HEX Input vs Visual Picker**:

- Start with HEX text input (simple, works everywhere)
- Can add visual picker later (React Native color picker library)
- Text input is precise and works on all platforms

**Separate Light/Dark Colors**:

- Allows full customization per mode
- More complex but more flexible
- Users can have different aesthetics per mode

**No Preset Palettes**:

- Keep Phase 3 focused on custom colors
- Could add preset palettes in future phase
- Users can share HEX codes manually

**JSON Storage in Convex**:

- Flexible for schema evolution
- Easy to add new color properties
- Requires careful parsing and validation

---

## Future Enhancements (Post-Phase 3)

- Visual color picker component (React Native Color Picker)
- Preset color palettes (Ocean Blue, Forest Green, etc.)
- Import/export theme JSON
- Share themes with other users
- Accessibility checker (contrast ratios)
- Live preview mode in editor
- Color scheme generator (auto-generate complementary colors)

---

## Next Steps

After Phase 3 is complete:

1. All personalization features implemented! 🎉
2. Consider user feedback for additional customization
3. Explore other feature areas from roadmap
