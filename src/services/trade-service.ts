import AsyncStorage from '@react-native-async-storage/async-storage';

import { Trade } from '../types';
import { generateTradeKey } from '../utils/csv-import';

const STORAGE_KEY = '@trades';

/**
 * Service layer for trade persistence
 * This abstraction makes it easy to swap storage backends (e.g., local → cloud API)
 */
export const tradeService = {
  /**
   * Fetch all trades from storage
   */
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
      console.error('Error loading trades:', error);
      throw error;
    }
  },

  /**
   * Add a new trade
   */
  async addTrade(trade: Trade): Promise<Trade> {
    try {
      const trades = await this.getTrades();
      const newTrades = [...trades, trade];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
      return trade;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  },

  /**
   * Update an existing trade
   */
  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    try {
      const trades = await this.getTrades();
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

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
      return updatedTrade;
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  },

  /**
   * Delete a trade by ID
   */
  async deleteTrade(id: string): Promise<void> {
    try {
      const trades = await this.getTrades();
      const newTrades = trades.filter((t) => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  },

  /**
   * Delete all trades
   */
  async clearAllTrades(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing trades:', error);
      throw error;
    }
  },

  /**
   * Import multiple trades with duplicate detection
   */
  async importTrades(
    trades: Trade[]
  ): Promise<{ imported: number; skipped: number }> {
    try {
      const existingTrades = await this.getTrades();

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

      // Save all trades
      const updatedTrades = [...existingTrades, ...newTrades];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrades));

      return { imported: newTrades.length, skipped };
    } catch (error) {
      console.error('Error importing trades:', error);
      throw error;
    }
  },
};
