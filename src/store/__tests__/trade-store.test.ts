import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTradeStore } from '../trade-store';

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

describe('useTradeStore', () => {
  beforeEach(async () => {
    // Reset store state between tests
    useTradeStore.setState({ trades: [], isLoading: false });
    await AsyncStorage.clear();
  });

  describe('addTrade', () => {
    it('should add a trade to the store', async () => {
      const trade = createMockTrade();

      await useTradeStore.getState().addTrade(trade);

      const { trades } = useTradeStore.getState();
      expect(trades).toHaveLength(1);
      expect(trades[0]).toEqual(trade);
    });

    it('should persist trade to AsyncStorage', async () => {
      const trade = createMockTrade();

      await useTradeStore.getState().addTrade(trade);

      const stored = await AsyncStorage.getItem('@trades');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toHaveLength(1);
    });

    it('should add multiple trades', async () => {
      const trade1 = createMockTrade({ id: '1', symbol: 'AAPL' });
      const trade2 = createMockTrade({ id: '2', symbol: 'GOOGL' });

      await useTradeStore.getState().addTrade(trade1);
      await useTradeStore.getState().addTrade(trade2);

      const { trades } = useTradeStore.getState();
      expect(trades).toHaveLength(2);
    });
  });

  describe('deleteTrade', () => {
    it('should remove a trade from the store', async () => {
      const trade = createMockTrade();
      await useTradeStore.getState().addTrade(trade);

      await useTradeStore.getState().deleteTrade(trade.id);

      const { trades } = useTradeStore.getState();
      expect(trades).toHaveLength(0);
    });

    it('should only remove the specified trade', async () => {
      const trade1 = createMockTrade({ id: '1' });
      const trade2 = createMockTrade({ id: '2' });
      await useTradeStore.getState().addTrade(trade1);
      await useTradeStore.getState().addTrade(trade2);

      await useTradeStore.getState().deleteTrade('1');

      const { trades } = useTradeStore.getState();
      expect(trades).toHaveLength(1);
      expect(trades[0].id).toBe('2');
    });
  });

  describe('updateTrade', () => {
    it('should update a trade in the store', async () => {
      const trade = createMockTrade();
      await useTradeStore.getState().addTrade(trade);

      await useTradeStore.getState().updateTrade('1', { symbol: 'GOOGL' });

      const { trades } = useTradeStore.getState();
      expect(trades[0].symbol).toBe('GOOGL');
    });

    it('should not modify other trades', async () => {
      const trade1 = createMockTrade({ id: '1', symbol: 'AAPL' });
      const trade2 = createMockTrade({ id: '2', symbol: 'MSFT' });
      await useTradeStore.getState().addTrade(trade1);
      await useTradeStore.getState().addTrade(trade2);

      await useTradeStore.getState().updateTrade('1', { symbol: 'GOOGL' });

      const { trades } = useTradeStore.getState();
      expect(trades[1].symbol).toBe('MSFT');
    });
  });

  describe('loadTrades', () => {
    it('should load trades from AsyncStorage', async () => {
      const trade = createMockTrade();
      await AsyncStorage.setItem('@trades', JSON.stringify([trade]));

      await useTradeStore.getState().loadTrades();

      const { trades } = useTradeStore.getState();
      expect(trades).toHaveLength(1);
      expect(trades[0].symbol).toBe('AAPL');
    });

    it('should set isLoading to false after loading', async () => {
      await useTradeStore.getState().loadTrades();

      const { isLoading } = useTradeStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should handle empty storage', async () => {
      await useTradeStore.getState().loadTrades();

      const { trades } = useTradeStore.getState();
      expect(trades).toHaveLength(0);
    });
  });

  describe('clearAllTrades', () => {
    it('should remove all trades', async () => {
      const trade1 = createMockTrade({ id: '1' });
      const trade2 = createMockTrade({ id: '2' });
      await useTradeStore.getState().addTrade(trade1);
      await useTradeStore.getState().addTrade(trade2);

      await useTradeStore.getState().clearAllTrades();

      const { trades } = useTradeStore.getState();
      expect(trades).toHaveLength(0);
    });

    it('should clear AsyncStorage', async () => {
      const trade = createMockTrade();
      await useTradeStore.getState().addTrade(trade);

      await useTradeStore.getState().clearAllTrades();

      const stored = await AsyncStorage.getItem('@trades');
      expect(stored).toBeNull();
    });
  });
});
