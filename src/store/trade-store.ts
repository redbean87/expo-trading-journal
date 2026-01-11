import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { Trade } from '../types';
import { generateTradeKey } from '../utils/csv-import';

interface TradeStore {
  trades: Trade[];
  isLoading: boolean;
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  loadTrades: () => Promise<void>;
  clearAllTrades: () => Promise<void>;
  importTrades: (
    trades: Trade[]
  ) => Promise<{ imported: number; skipped: number }>;
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
        const trades = JSON.parse(stored).map((trade: Trade) => ({
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

  importTrades: async (trades: Trade[]) => {
    const existingTrades = get().trades;

    // Create a Set of existing trade keys for duplicate detection
    const existingKeys = new Set(
      existingTrades.map((trade) => {
        const entryTimeStr = trade.entryTime.toISOString();
        return generateTradeKey({
          symbol: trade.symbol,
          entryTime: entryTimeStr,
          quantity: trade.quantity,
        });
      })
    );

    // Filter out duplicates
    const newTrades: Trade[] = [];
    let skipped = 0;

    trades.forEach((trade) => {
      const entryTimeStr = trade.entryTime.toISOString();
      const key = generateTradeKey({
        symbol: trade.symbol,
        entryTime: entryTimeStr,
        quantity: trade.quantity,
      });

      if (!existingKeys.has(key)) {
        newTrades.push(trade);
        existingKeys.add(key);
      } else {
        skipped++;
      }
    });

    // Add new trades to store
    const updatedTrades = [...existingTrades, ...newTrades];
    set({ trades: updatedTrades });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrades));
    } catch (error) {
      console.error('Error saving imported trades:', error);
    }

    return { imported: newTrades.length, skipped };
  },
}));
