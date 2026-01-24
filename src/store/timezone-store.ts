import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type TimezoneOption = {
  value: string;
  label: string;
};

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'UTC', label: 'UTC' },
];

type TimezoneStore = {
  timezone: string;
  isLoading: boolean;
  setTimezone: (tz: string) => Promise<void>;
  loadTimezone: () => Promise<void>;
  setFromCloud: (tz: string) => void;
};

const TIMEZONE_STORAGE_KEY = '@timezone';

function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York';
  }
}

export const useTimezoneStore = create<TimezoneStore>((set) => ({
  timezone: getDeviceTimezone(),
  isLoading: true,

  loadTimezone: async () => {
    try {
      const stored = await AsyncStorage.getItem(TIMEZONE_STORAGE_KEY);
      if (stored) {
        set({ timezone: stored, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading timezone:', error);
      set({ isLoading: false });
    }
  },

  setTimezone: async (tz: string) => {
    set({ timezone: tz });
    try {
      await AsyncStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
    } catch (error) {
      console.error('Error saving timezone:', error);
    }
  },

  setFromCloud: (tz: string) => {
    set({ timezone: tz });
  },
}));
