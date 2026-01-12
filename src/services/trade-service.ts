import AsyncStorage from '@react-native-async-storage/async-storage';

import { Trade } from '../types';

const STORAGE_KEY = '@trades';

/**
 * Local storage service for offline fallback
 * This is used when the API service fails
 */
const localStorageService = {
  async getTrades(): Promise<Trade[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const trades = JSON.parse(stored).map((trade: Trade) => ({
        ...trade,
        entryTime: new Date(trade.entryTime),
        exitTime: new Date(trade.exitTime),
      }));

      return trades;
    } catch (error) {
      console.error('Error loading trades from local storage:', error);
      return [];
    }
  },

  async saveTrades(trades: Trade[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    } catch (error) {
      console.error('Error saving trades to local storage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  },
};

/**
 * Trade service with cloud sync and offline fallback
 * Automatically falls back to local storage when offline
 * Backend is abstracted - can be swapped without changing screens
 */
type ApiService = {
  getTrades: () => Promise<Trade[]>;
  addTrade: (trade: Trade) => Promise<Trade>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<Trade>;
  deleteTrade: (id: string) => Promise<void>;
  clearAllTrades: () => Promise<void>;
  importTrades: (
    trades: Trade[]
  ) => Promise<{ imported: number; skipped: number }>;
};

let apiService: ApiService | null = null;

export const setApiService = (service: ApiService | null) => {
  apiService = service;
};

export const tradeService = {
  async getTrades(): Promise<Trade[]> {
    if (!apiService) {
      // No API configured, use local storage only
      return localStorageService.getTrades();
    }

    try {
      // Try cloud sync first
      const trades = await apiService.getTrades();

      // Cache locally for offline access
      await localStorageService.saveTrades(trades);

      return trades;
    } catch (error) {
      console.warn('Failed to fetch from cloud, using local cache:', error);
      // Fallback to local storage
      return localStorageService.getTrades();
    }
  },

  async addTrade(trade: Trade): Promise<Trade> {
    if (!apiService) {
      // Local only mode
      const trades = await localStorageService.getTrades();
      const newTrades = [...trades, trade];
      await localStorageService.saveTrades(newTrades);
      return trade;
    }

    try {
      return await apiService.addTrade(trade);
    } catch (error) {
      console.error('Failed to add trade to cloud:', error);
      throw error;
    }
  },

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    if (!apiService) {
      // Local only mode
      const trades = await localStorageService.getTrades();
      const tradeIndex = trades.findIndex((t) => t.id === id);

      if (tradeIndex === -1) {
        throw new Error(`Trade with id ${id} not found`);
      }

      const updatedTrade = { ...trades[tradeIndex], ...updates };
      const newTrades = [
        ...trades.slice(0, tradeIndex),
        updatedTrade,
        ...trades.slice(tradeIndex + 1),
      ];

      await localStorageService.saveTrades(newTrades);
      return updatedTrade;
    }

    try {
      return await apiService.updateTrade(id, updates);
    } catch (error) {
      console.error('Failed to update trade in cloud:', error);
      throw error;
    }
  },

  async deleteTrade(id: string): Promise<void> {
    if (!apiService) {
      // Local only mode
      const trades = await localStorageService.getTrades();
      const newTrades = trades.filter((t) => t.id !== id);
      await localStorageService.saveTrades(newTrades);
      return;
    }

    try {
      await apiService.deleteTrade(id);
    } catch (error) {
      console.error('Failed to delete trade from cloud:', error);
      throw error;
    }
  },

  async clearAllTrades(): Promise<void> {
    if (!apiService) {
      // Local only mode
      await localStorageService.clear();
      return;
    }

    try {
      await apiService.clearAllTrades();
      await localStorageService.clear();
    } catch (error) {
      console.error('Failed to clear trades from cloud:', error);
      throw error;
    }
  },

  async importTrades(
    trades: Trade[]
  ): Promise<{ imported: number; skipped: number }> {
    if (!apiService) {
      // Local only mode - basic import without duplicate detection
      const existingTrades = await localStorageService.getTrades();
      const newTrades = [...existingTrades, ...trades];
      await localStorageService.saveTrades(newTrades);
      return { imported: trades.length, skipped: 0 };
    }

    try {
      return await apiService.importTrades(trades);
    } catch (error) {
      console.error('Failed to import trades to cloud:', error);
      throw error;
    }
  },
};
