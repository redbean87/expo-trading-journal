import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { DateRangePreset } from '../utils/date-range';

type TimeFilterStore = {
  selectedRange: DateRangePreset;
  customRangeStart: number | null;
  customRangeEnd: number | null;
  isLoading: boolean;
  setSelectedRange: (range: DateRangePreset) => Promise<void>;
  setCustomRange: (start: number, end: number) => Promise<void>;
  loadTimeFilter: (fallbackRange?: DateRangePreset) => Promise<void>;
};

type PersistedTimeFilter = {
  selectedRange: DateRangePreset;
  customRangeStart: number | null;
  customRangeEnd: number | null;
};

const TIME_FILTER_STORAGE_KEY = '@time_filter_range';

export const useTimeFilterStore = create<TimeFilterStore>((set) => ({
  selectedRange: 'all',
  customRangeStart: null,
  customRangeEnd: null,
  isLoading: true,

  loadTimeFilter: async (fallbackRange?: DateRangePreset) => {
    try {
      const stored = await AsyncStorage.getItem(TIME_FILTER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedTimeFilter;
        set({
          selectedRange: parsed.selectedRange ?? fallbackRange ?? 'all',
          customRangeStart: parsed.customRangeStart ?? null,
          customRangeEnd: parsed.customRangeEnd ?? null,
          isLoading: false,
        });
      } else {
        set({
          selectedRange: fallbackRange ?? 'all',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading time filter:', error);
      set({ isLoading: false });
    }
  },

  setSelectedRange: async (range: DateRangePreset) => {
    set({ selectedRange: range });
    try {
      const current = {
        selectedRange: range,
        customRangeStart: null,
        customRangeEnd: null,
      } as PersistedTimeFilter;
      await AsyncStorage.setItem(
        TIME_FILTER_STORAGE_KEY,
        JSON.stringify(current)
      );
    } catch (error) {
      console.error('Error saving time filter:', error);
    }
  },

  setCustomRange: async (start: number, end: number) => {
    set({ customRangeStart: start, customRangeEnd: end });
    try {
      const current = {
        selectedRange: 'custom' as DateRangePreset,
        customRangeStart: start,
        customRangeEnd: end,
      };
      await AsyncStorage.setItem(
        TIME_FILTER_STORAGE_KEY,
        JSON.stringify(current)
      );
    } catch (error) {
      console.error('Error saving custom time range:', error);
    }
  },
}));
