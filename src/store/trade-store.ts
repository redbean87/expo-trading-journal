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
  ) => Promise<{ imported: number; skipped: number; updated: number }>;
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

    // Map from key → existing trade for duplicate/upgrade detection
    const existingTradeMap = new Map(
      existingTrades.map((trade) => {
        const key = generateTradeKey({
          symbol: trade.symbol,
          entryTime: trade.entryTime.toISOString(),
          quantity: trade.quantity,
        });
        return [key, trade];
      })
    );

    const newTrades: Trade[] = [];
    const upgradedTrades = new Map<string, Trade>(); // id → upgraded trade
    let skipped = 0;
    let updated = 0;

    trades.forEach((trade) => {
      const key = generateTradeKey({
        symbol: trade.symbol,
        entryTime: trade.entryTime.toISOString(),
        quantity: trade.quantity,
      });
      const existing = existingTradeMap.get(key);

      if (!existing) {
        newTrades.push(trade);
        existingTradeMap.set(key, trade);
      } else if (
        existing.importedFrom === 'trade-history' &&
        trade.importedFrom === 'cash-balance'
      ) {
        upgradedTrades.set(existing.id, {
          ...existing,
          fees: trade.fees,
          commissions: trade.commissions,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          pnl: trade.pnl,
          pnlPercent: trade.pnlPercent,
          importedFrom: 'cash-balance',
        });
        updated++;
      } else {
        skipped++;
      }
    });

    const finalTrades = [
      ...existingTrades.map((t) => upgradedTrades.get(t.id) ?? t),
      ...newTrades,
    ];
    set({ trades: finalTrades });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalTrades));
    } catch (error) {
      console.error('Error saving imported trades:', error);
    }

    return { imported: newTrades.length, skipped, updated };
  },
}));
