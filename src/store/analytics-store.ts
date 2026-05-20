import { create } from 'zustand';

type AnalyticsStore = {
  selectedStrategy: string | null;
  setSelectedStrategy: (strategy: string | null) => void;
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  selectedStrategy: null,
  setSelectedStrategy: (strategy: string | null) =>
    set({ selectedStrategy: strategy }),
}));
