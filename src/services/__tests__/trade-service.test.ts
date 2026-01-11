import AsyncStorage from '@react-native-async-storage/async-storage';

import { tradeService } from '../trade-service';

import type { Trade } from '../../types';

const createMockTrade = (overrides: Partial<Trade> = {}): Trade => ({
  id: '1',
  symbol: 'AAPL',
  entryPrice: 150,
  exitPrice: 160,
  quantity: 10,
  entryTime: new Date('2024-01-01'),
  exitTime: new Date('2024-01-02'),
  side: 'long',
  pnl: 100,
  pnlPercent: 6.67,
  ...overrides,
});

describe('tradeService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('getTrades', () => {
    it('should return empty array when no trades exist', async () => {
      const trades = await tradeService.getTrades();
      expect(trades).toEqual([]);
    });

    it('should return trades from AsyncStorage', async () => {
      const mockTrade = createMockTrade();
      await AsyncStorage.setItem('@trades', JSON.stringify([mockTrade]));

      const trades = await tradeService.getTrades();
      expect(trades).toHaveLength(1);
      expect(trades[0].symbol).toBe('AAPL');
    });

    it('should parse date strings to Date objects', async () => {
      const mockTrade = createMockTrade();
      await AsyncStorage.setItem('@trades', JSON.stringify([mockTrade]));

      const trades = await tradeService.getTrades();
      expect(trades[0].entryTime).toBeInstanceOf(Date);
      expect(trades[0].exitTime).toBeInstanceOf(Date);
    });
  });

  describe('addTrade', () => {
    it('should add a trade to storage', async () => {
      const trade = createMockTrade();

      await tradeService.addTrade(trade);

      const stored = await AsyncStorage.getItem('@trades');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].symbol).toBe('AAPL');
    });

    it('should add multiple trades', async () => {
      const trade1 = createMockTrade({ id: '1', symbol: 'AAPL' });
      const trade2 = createMockTrade({ id: '2', symbol: 'GOOGL' });

      await tradeService.addTrade(trade1);
      await tradeService.addTrade(trade2);

      const trades = await tradeService.getTrades();
      expect(trades).toHaveLength(2);
    });

    it('should return the added trade', async () => {
      const trade = createMockTrade();

      const result = await tradeService.addTrade(trade);

      expect(result).toEqual(trade);
    });
  });

  describe('updateTrade', () => {
    it('should update an existing trade', async () => {
      const trade = createMockTrade();
      await tradeService.addTrade(trade);

      const updated = await tradeService.updateTrade('1', { symbol: 'GOOGL' });

      expect(updated.symbol).toBe('GOOGL');
      expect(updated.entryPrice).toBe(150);
    });

    it('should throw error if trade not found', async () => {
      await expect(
        tradeService.updateTrade('999', { symbol: 'GOOGL' })
      ).rejects.toThrow('Trade with id 999 not found');
    });

    it('should not modify other trades', async () => {
      const trade1 = createMockTrade({ id: '1', symbol: 'AAPL' });
      const trade2 = createMockTrade({ id: '2', symbol: 'MSFT' });
      await tradeService.addTrade(trade1);
      await tradeService.addTrade(trade2);

      await tradeService.updateTrade('1', { symbol: 'GOOGL' });

      const trades = await tradeService.getTrades();
      expect(trades[1].symbol).toBe('MSFT');
    });
  });

  describe('deleteTrade', () => {
    it('should remove a trade from storage', async () => {
      const trade = createMockTrade();
      await tradeService.addTrade(trade);

      await tradeService.deleteTrade('1');

      const trades = await tradeService.getTrades();
      expect(trades).toHaveLength(0);
    });

    it('should only remove the specified trade', async () => {
      const trade1 = createMockTrade({ id: '1' });
      const trade2 = createMockTrade({ id: '2' });
      await tradeService.addTrade(trade1);
      await tradeService.addTrade(trade2);

      await tradeService.deleteTrade('1');

      const trades = await tradeService.getTrades();
      expect(trades).toHaveLength(1);
      expect(trades[0].id).toBe('2');
    });
  });

  describe('clearAllTrades', () => {
    it('should remove all trades from storage', async () => {
      const trade1 = createMockTrade({ id: '1' });
      const trade2 = createMockTrade({ id: '2' });
      await tradeService.addTrade(trade1);
      await tradeService.addTrade(trade2);

      await tradeService.clearAllTrades();

      const stored = await AsyncStorage.getItem('@trades');
      expect(stored).toBeNull();
    });
  });

  describe('importTrades', () => {
    it('should import new trades', async () => {
      const trade1 = createMockTrade({ id: '1', symbol: 'AAPL' });
      const trade2 = createMockTrade({ id: '2', symbol: 'GOOGL' });

      const result = await tradeService.importTrades([trade1, trade2]);

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
    });

    it('should skip duplicate trades', async () => {
      const trade = createMockTrade();
      await tradeService.addTrade(trade);

      const result = await tradeService.importTrades([trade]);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should import only new trades and skip duplicates', async () => {
      const trade1 = createMockTrade({ id: '1', symbol: 'AAPL' });
      const trade2 = createMockTrade({ id: '2', symbol: 'GOOGL' });
      await tradeService.addTrade(trade1);

      const result = await tradeService.importTrades([trade1, trade2]);

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);

      const trades = await tradeService.getTrades();
      expect(trades).toHaveLength(2);
    });
  });
});
