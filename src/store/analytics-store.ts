import { create } from 'zustand';

import { DateRangePreset } from '../utils/date-range';

type AnalyticsStore = {
  selectedRange: DateRangePreset;
  setSelectedRange: (range: DateRangePreset) => void;
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  selectedRange: 'all',
  setSelectedRange: (range: DateRangePreset) => set({ selectedRange: range }),
}));
