import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { CustomColors, CustomThemePreset } from '../types';

type CustomThemeStore = {
  preset: CustomThemePreset;
  customColors: CustomColors | null;
  isLoading: boolean;
  setPreset: (preset: CustomThemePreset) => Promise<void>;
  setCustomColors: (colors: CustomColors) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  loadCustomTheme: () => Promise<void>;
  setFromCloud: (
    preset: CustomThemePreset,
    colors: CustomColors | null
  ) => void;
};

const CUSTOM_THEME_STORAGE_KEY = '@custom_theme';

// HEX validation regex
const HEX_PATTERN = /^#[0-9A-F]{6}$/i;

function validateCustomColors(colors: CustomColors): boolean {
  // Validate required colors
  const requiredColors = [colors.primary, colors.profit, colors.loss];

  return requiredColors.every((color) => HEX_PATTERN.test(color));
}

export const useCustomThemeStore = create<CustomThemeStore>((set) => ({
  preset: 'default',
  customColors: null,
  isLoading: true,

  loadCustomTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate before setting
        if (parsed.preset === 'custom' && parsed.customColors) {
          if (validateCustomColors(parsed.customColors)) {
            set({
              preset: parsed.preset,
              customColors: parsed.customColors,
              isLoading: false,
            });
            return;
          }
        } else if (parsed.preset === 'default') {
          set({
            preset: 'default',
            customColors: parsed.customColors ?? null,
            isLoading: false,
          });
          return;
        }
      }
      set({ isLoading: false });
    } catch (error) {
      console.error('Error loading custom theme:', error);
      set({ isLoading: false });
    }
  },

  setPreset: async (preset: CustomThemePreset) => {
    const state = useCustomThemeStore.getState();
    const newState = { preset, customColors: state.customColors };

    set({ preset });
    try {
      await AsyncStorage.setItem(
        CUSTOM_THEME_STORAGE_KEY,
        JSON.stringify(newState)
      );
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  },

  setCustomColors: async (colors: CustomColors) => {
    // Validate before setting
    if (!validateCustomColors(colors)) {
      throw new Error(
        'Invalid color format. All colors must be valid HEX (#RRGGBB)'
      );
    }

    const newState = { preset: 'custom' as const, customColors: colors };

    set(newState);
    try {
      await AsyncStorage.setItem(
        CUSTOM_THEME_STORAGE_KEY,
        JSON.stringify(newState)
      );
    } catch (error) {
      console.error('Error saving custom colors:', error);
    }
  },

  resetToDefaults: async () => {
    const newState = { preset: 'default' as const, customColors: null };

    set(newState);
    try {
      await AsyncStorage.setItem(
        CUSTOM_THEME_STORAGE_KEY,
        JSON.stringify(newState)
      );
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
  },

  setFromCloud: (preset: CustomThemePreset, colors: CustomColors | null) => {
    set({ preset, customColors: colors });
  },
}));
