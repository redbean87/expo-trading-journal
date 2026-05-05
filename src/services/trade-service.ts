import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { Trade } from '../types';

const STORAGE_KEY = '@trades';

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

type ApiService = {
  getTrades: () => Promise<Trade[]>;
  addTrade: (trade: Trade | Omit<Trade, 'id'>) => Promise<Trade>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<Trade>;
  deleteTrade: (id: string) => Promise<void>;
  clearAllTrades: () => Promise<void>;
  importTrades: (
    trades: (Trade | Omit<Trade, 'id'>)[]
  ) => Promise<{ imported: number; skipped: number }>;
};

let apiService: ApiService | null = null;

export const setApiService = (service: ApiService | null) => {
  apiService = service;
};

export const tradeService = {
  async getTrades(): Promise<Trade[]> {
    if (!apiService) {
      return localStorageService.getTrades();
    }

    try {
      const trades = await apiService.getTrades();

      await localStorageService.saveTrades(trades);

      return trades;
    } catch (error) {
      console.warn('Failed to fetch from cloud, using local cache:', error);
      return localStorageService.getTrades();
    }
  },

  async addTrade(trade: Trade | Omit<Trade, 'id'>): Promise<Trade> {
    if (!apiService) {
      const trades = await localStorageService.getTrades();
      const tradeWithId: Trade =
        'id' in trade ? trade : { ...trade, id: uuidv4() };
      const newTrades = [...trades, tradeWithId];
      await localStorageService.saveTrades(newTrades);
      return tradeWithId;
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
    trades: (Trade | Omit<Trade, 'id'>)[]
  ): Promise<{ imported: number; skipped: number }> {
    if (!apiService) {
      const existingTrades = await localStorageService.getTrades();
      const existingKeys = new Set(
        existingTrades.map(
          (t) => `${t.symbol}-${t.entryTime.getTime()}-${t.quantity}`
        )
      );

      const uniqueTrades: Trade[] = [];
      let skipped = 0;
      for (const trade of trades) {
        const key = `${trade.symbol}-${trade.entryTime.getTime()}-${trade.quantity}`;
        if (!existingKeys.has(key)) {
          uniqueTrades.push('id' in trade ? trade : { ...trade, id: uuidv4() });
          existingKeys.add(key);
        } else {
          skipped++;
        }
      }

      const newTrades = [...existingTrades, ...uniqueTrades];
      await localStorageService.saveTrades(newTrades);
      return { imported: uniqueTrades.length, skipped };
    }

    try {
      return await apiService.importTrades(trades);
    } catch (error) {
      console.error('Failed to import trades to cloud:', error);
      throw error;
    }
  },
};
