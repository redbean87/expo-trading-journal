import { create } from 'zustand';

import { DateRangePreset } from '../utils/date-range';

type AnalyticsStore = {
  selectedRange: DateRangePreset;
  customRangeStart: number | null;
  customRangeEnd: number | null;
  setSelectedRange: (range: DateRangePreset) => void;
  setCustomRange: (start: number, end: number) => void;
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  selectedRange: 'all',
  customRangeStart: null,
  customRangeEnd: null,
  setSelectedRange: (range: DateRangePreset) => set({ selectedRange: range }),
  setCustomRange: (start: number, end: number) =>
    set({ customRangeStart: start, customRangeEnd: end }),
}));
