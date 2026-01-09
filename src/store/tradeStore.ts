import { create } from 'zustand';
import { Trade } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TradeStore {
  trades: Trade[];
  isLoading: boolean;
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  loadTrades: () => Promise<void>;
  clearAllTrades: () => Promise<void>;
}

const STORAGE_KEY = '@trades';

export const useTradeStore = create<TradeStore>((set, get) => ({
  trades: [],
  isLoading: false,

  loadTrades: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const trades = JSON.parse(stored).map((trade: any) => ({
          ...trade,
          entryTime: new Date(trade.entryTime),
          exitTime: new Date(trade.exitTime),
        }));
        set({ trades, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      set({ isLoading: false });
    }
  },

  addTrade: async (trade: Trade) => {
    const newTrades = [...get().trades, trade];
    set({ trades: newTrades });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  },

  updateTrade: async (id: string, updates: Partial<Trade>) => {
    const newTrades = get().trades.map((trade) =>
      trade.id === id ? { ...trade, ...updates } : trade
    );
    set({ trades: newTrades });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  },

  deleteTrade: async (id: string) => {
    const newTrades = get().trades.filter((trade) => trade.id !== id);
    set({ trades: newTrades });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  },

  clearAllTrades: async () => {
    set({ trades: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing trades:', error);
    }
  },
}));
