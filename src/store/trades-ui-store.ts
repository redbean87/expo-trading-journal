import { create } from 'zustand';

type TradesUIStore = {
  selectedTradeId: string | null;
  setSelectedTradeId: (id: string | null) => void;
  clearSelection: () => void;
};

export const useTradesUIStore = create<TradesUIStore>((set) => ({
  selectedTradeId: null,
  setSelectedTradeId: (id) => set({ selectedTradeId: id }),
  clearSelection: () => set({ selectedTradeId: null }),
}));
