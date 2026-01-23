import { Trade } from '../../types';
import { groupTradesByPeriod } from '../period-grouping';

const createTrade = (overrides: Partial<Trade> = {}): Trade => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  symbol: 'AAPL',
  entryPrice: 100,
  exitPrice: 110,
  quantity: 10,
  entryTime: new Date('2024-01-15T10:00:00'),
  exitTime: new Date('2024-01-15T14:00:00'),
  side: 'long',
  pnl: 100,
  pnlPercent: 10,
  ...overrides,
});

describe('groupTradesByPeriod', () => {
  describe('empty trades', () => {
    it('should return empty array for empty trades', () => {
      const result = groupTradesByPeriod([], 'month');
      expect(result).toEqual([]);
    });

    it('should return empty array for weekly with no trades', () => {
      const result = groupTradesByPeriod([], 'week');
      expect(result).toEqual([]);
    });
  });

  describe('single trade', () => {
    it('should group single trade by month', () => {
      const trades = [
        createTrade({ exitTime: new Date('2024-03-15T14:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result.length).toBe(1);
      expect(result[0].periodKey).toBe('2024-03');
      expect(result[0].periodLabel).toBe('March 2024');
      expect(result[0].tradeCount).toBe(1);
      expect(result[0].totalPnl).toBe(100);
      expect(result[0].winRate).toBe(100);
      expect(result[0].avgTradePnl).toBe(100);
    });

    it('should group single trade by week', () => {
      const trades = [
        createTrade({ exitTime: new Date('2024-01-17T14:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'week');

      expect(result.length).toBe(1);
      expect(result[0].periodKey).toBe('2024-W03');
      expect(result[0].periodLabel).toMatch(/Week of Jan 15/);
      expect(result[0].tradeCount).toBe(1);
    });
  });

  describe('multiple trades same period', () => {
    it('should aggregate trades in same month', () => {
      const trades = [
        createTrade({ pnl: 100, exitTime: new Date('2024-02-05T12:00:00') }),
        createTrade({ pnl: -50, exitTime: new Date('2024-02-15T12:00:00') }),
        createTrade({ pnl: 75, exitTime: new Date('2024-02-25T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result.length).toBe(1);
      expect(result[0].periodKey).toBe('2024-02');
      expect(result[0].tradeCount).toBe(3);
      expect(result[0].totalPnl).toBe(125);
      expect(result[0].winRate).toBeCloseTo(66.67, 1);
      expect(result[0].avgTradePnl).toBeCloseTo(41.67, 1);
    });

    it('should aggregate trades in same week', () => {
      const trades = [
        createTrade({ pnl: 200, exitTime: new Date('2024-01-15T12:00:00') }),
        createTrade({ pnl: -100, exitTime: new Date('2024-01-16T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'week');

      expect(result.length).toBe(1);
      expect(result[0].tradeCount).toBe(2);
      expect(result[0].totalPnl).toBe(100);
      expect(result[0].winRate).toBe(50);
    });
  });

  describe('trades across multiple periods', () => {
    it('should separate trades by month', () => {
      const trades = [
        createTrade({ pnl: 100, exitTime: new Date('2024-01-15T12:00:00') }),
        createTrade({ pnl: 200, exitTime: new Date('2024-02-15T12:00:00') }),
        createTrade({ pnl: -50, exitTime: new Date('2024-03-15T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result.length).toBe(3);
      expect(result.map((p) => p.periodKey)).toEqual([
        '2024-03',
        '2024-02',
        '2024-01',
      ]);
    });

    it('should separate trades by week', () => {
      const trades = [
        createTrade({ pnl: 100, exitTime: new Date('2024-01-08T12:00:00') }),
        createTrade({ pnl: 200, exitTime: new Date('2024-01-15T12:00:00') }),
        createTrade({ pnl: 50, exitTime: new Date('2024-01-22T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'week');

      expect(result.length).toBe(3);
    });

    it('should sort periods most recent first', () => {
      const trades = [
        createTrade({ exitTime: new Date('2024-01-15T12:00:00') }),
        createTrade({ exitTime: new Date('2024-03-15T12:00:00') }),
        createTrade({ exitTime: new Date('2024-02-15T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result[0].periodKey).toBe('2024-03');
      expect(result[1].periodKey).toBe('2024-02');
      expect(result[2].periodKey).toBe('2024-01');
    });
  });

  describe('period boundaries', () => {
    it('should handle month boundary correctly', () => {
      const trades = [
        createTrade({ exitTime: new Date('2024-01-31T23:59:59') }),
        createTrade({ exitTime: new Date('2024-02-01T00:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result.length).toBe(2);
      expect(result.find((p) => p.periodKey === '2024-01')).toBeDefined();
      expect(result.find((p) => p.periodKey === '2024-02')).toBeDefined();
    });

    it('should handle week boundary correctly (Sunday to Monday)', () => {
      const trades = [
        createTrade({ exitTime: new Date('2024-01-14T23:59:59') }),
        createTrade({ exitTime: new Date('2024-01-15T00:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'week');

      expect(result.length).toBe(2);
    });

    it('should handle year boundary', () => {
      const trades = [
        createTrade({ exitTime: new Date('2023-12-31T12:00:00') }),
        createTrade({ exitTime: new Date('2024-01-01T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result.length).toBe(2);
      expect(result.find((p) => p.periodKey === '2023-12')).toBeDefined();
      expect(result.find((p) => p.periodKey === '2024-01')).toBeDefined();
    });
  });

  describe('metrics calculation', () => {
    it('should calculate win rate correctly with all winners', () => {
      const trades = [
        createTrade({ pnl: 100, exitTime: new Date('2024-01-15T12:00:00') }),
        createTrade({ pnl: 50, exitTime: new Date('2024-01-16T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result[0].winRate).toBe(100);
    });

    it('should calculate win rate correctly with all losers', () => {
      const trades = [
        createTrade({ pnl: -100, exitTime: new Date('2024-01-15T12:00:00') }),
        createTrade({ pnl: -50, exitTime: new Date('2024-01-16T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result[0].winRate).toBe(0);
    });

    it('should not count break-even trades as wins', () => {
      const trades = [
        createTrade({ pnl: 100, exitTime: new Date('2024-01-15T12:00:00') }),
        createTrade({ pnl: 0, exitTime: new Date('2024-01-16T12:00:00') }),
        createTrade({ pnl: -50, exitTime: new Date('2024-01-17T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result[0].tradeCount).toBe(3);
      expect(result[0].winRate).toBeCloseTo(33.33, 1);
    });
  });

  describe('period dates', () => {
    it('should set correct start and end dates for month', () => {
      const trades = [
        createTrade({ exitTime: new Date('2024-02-15T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'month');

      expect(result[0].startDate.getDate()).toBe(1);
      expect(result[0].startDate.getMonth()).toBe(1);
      expect(result[0].endDate.getMonth()).toBe(1);
    });

    it('should set correct start and end dates for week', () => {
      const trades = [
        createTrade({ exitTime: new Date('2024-01-17T12:00:00') }),
      ];
      const result = groupTradesByPeriod(trades, 'week');

      const monday = result[0].startDate;
      expect(monday.getDay()).toBe(1);
    });
  });
});
