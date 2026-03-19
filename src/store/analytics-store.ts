import { create } from 'zustand';

import { DateRangePreset } from '../utils/date-range';

type AnalyticsStore = {
  selectedRange: DateRangePreset;
  customRangeStart: number | null;
  customRangeEnd: number | null;
  selectedStrategy: string | null;
  setSelectedRange: (range: DateRangePreset) => void;
  setCustomRange: (start: number, end: number) => void;
  setSelectedStrategy: (strategy: string | null) => void;
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  selectedRange: 'all',
  customRangeStart: null,
  customRangeEnd: null,
  selectedStrategy: null,
  setSelectedRange: (range: DateRangePreset) => set({ selectedRange: range }),
  setCustomRange: (start: number, end: number) =>
    set({ customRangeStart: start, customRangeEnd: end }),
  setSelectedStrategy: (strategy: string | null) =>
    set({ selectedStrategy: strategy }),
}));
