import { create } from 'zustand';

type TradesUIStore = {
  selectedTradeId: string | null;
  setSelectedTradeId: (id: string | null) => void;
  clearSelection: () => void;
  editingTradeId: string | null;
  setEditingTradeId: (id: string | null) => void;
};

export const useTradesUIStore = create<TradesUIStore>((set) => ({
  selectedTradeId: null,
  setSelectedTradeId: (id) => set({ selectedTradeId: id }),
  clearSelection: () => set({ selectedTradeId: null, editingTradeId: null }),
  editingTradeId: null,
  setEditingTradeId: (id) => set({ editingTradeId: id }),
}));
