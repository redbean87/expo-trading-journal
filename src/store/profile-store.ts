import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type ProfileStore = {
  displayName: string | null;
  isLoading: boolean;
  setDisplayName: (name: string | null) => Promise<void>;
  loadProfile: () => Promise<void>;
  setFromCloud: (name: string | null) => void;
};

const PROFILE_STORAGE_KEY = '@user_profile';

export const useProfileStore = create<ProfileStore>((set) => ({
  displayName: null,
  isLoading: true,

  loadProfile: async () => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        set({ displayName: profile.displayName ?? null, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ isLoading: false });
    }
  },

  setDisplayName: async (name: string | null) => {
    // Normalize: trim and convert empty string to null
    const trimmed = name ? name.trim() : null;
    const normalized = trimmed === '' ? null : trimmed;

    set({ displayName: normalized });
    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ displayName: normalized })
      );
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  },

  setFromCloud: (name: string | null) => {
    set({ displayName: name });
  },
}));
