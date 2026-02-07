import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { ThemeMode } from '../theme';

type ThemeStore = {
  themeMode: ThemeMode;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
  setFromCloud: (mode: ThemeMode) => void;
};

const THEME_STORAGE_KEY = '@theme_mode';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  themeMode: 'light',
  isLoading: true,

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        set({ themeMode: stored, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      set({ isLoading: false });
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  toggleTheme: async () => {
    const newMode = get().themeMode === 'light' ? 'dark' : 'light';
    await get().setThemeMode(newMode);
  },

  setFromCloud: (mode: ThemeMode) => {
    set({ themeMode: mode });
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((error) => {
      console.error('Error persisting cloud theme mode:', error);
    });
  },
}));
