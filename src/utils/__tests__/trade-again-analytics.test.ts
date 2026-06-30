import { Trade } from '../../types';
import { calculateTradeAgainAnalytics } from '../trade-again-analytics';

const createTrade = (overrides: Partial<Trade> = {}): Trade => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  symbol: 'AAPL',
  entryPrice: 100,
  exitPrice: 110,
  quantity: 10,
  entryTime: new Date('2024-01-01T10:00:00'),
  exitTime: new Date('2024-01-01T14:00:00'),
  side: 'long',
  pnl: 100,
  pnlPercent: 10,
  ...overrides,
});

describe('calculateTradeAgainAnalytics', () => {
  describe('empty trades', () => {
    it('should return zero values for empty trades array', () => {
      const result = calculateTradeAgainAnalytics([]);

      expect(result.totalTradesWithResponse).toBe(0);
      expect(result.totalTradesWithoutResponse).toBe(0);
      expect(result.bestPerformingOption).toBeNull();
      expect(result.worstPerformingOption).toBeNull();
    });
  });

  describe('trades without replay decision', () => {
    it('should count trades without a replay decision', () => {
      const trades = [
        createTrade({ wouldTakeTradeAgain: undefined }),
        createTrade({ wouldTakeTradeAgain: undefined }),
      ];
      const result = calculateTradeAgainAnalytics(trades);

      expect(result.totalTradesWithResponse).toBe(0);
      expect(result.totalTradesWithoutResponse).toBe(2);
    });
  });

  describe('option aggregation', () => {
    it('should aggregate trades by replay decision', () => {
      const trades = [
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 50 }),
        createTrade({ wouldTakeTradeAgain: 'no', pnl: -100 }),
        createTrade({ wouldTakeTradeAgain: 'withAdjustment', pnl: 25 }),
      ];
      const result = calculateTradeAgainAnalytics(trades);

      expect(result.byOption.yes.count).toBe(2);
      expect(result.byOption.no.count).toBe(1);
      expect(result.byOption.withAdjustment.count).toBe(1);
    });

    it('should calculate win rate by option', () => {
      const trades = [
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: -50 }),
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 0 }),
      ];
      const result = calculateTradeAgainAnalytics(trades);

      expect(result.byOption.yes.count).toBe(3);
      expect(result.byOption.yes.wins).toBe(1);
      expect(result.byOption.yes.losses).toBe(1);
      expect(result.byOption.yes.winRate).toBeCloseTo(33.33, 2);
    });

    it('should calculate average P&L by option', () => {
      const trades = [
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 200 }),
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: -50 }),
      ];
      const result = calculateTradeAgainAnalytics(trades);

      expect(result.byOption.yes.avgPnl).toBeCloseTo(83.33, 2);
      expect(result.byOption.yes.totalPnl).toBe(250);
    });
  });

  describe('best and worst performing options', () => {
    it('should identify best and worst options by avg P&L (min 2 trades)', () => {
      const trades = [
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'no', pnl: -100 }),
        createTrade({ wouldTakeTradeAgain: 'no', pnl: -100 }),
      ];
      const result = calculateTradeAgainAnalytics(trades);

      expect(result.bestPerformingOption).toBe('yes');
      expect(result.worstPerformingOption).toBe('no');
    });

    it('should require at least 2 trades per option to identify best/worst', () => {
      const trades = [
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'no', pnl: -100 }),
        createTrade({ wouldTakeTradeAgain: 'withAdjustment', pnl: 50 }),
      ];
      const result = calculateTradeAgainAnalytics(trades);

      expect(result.bestPerformingOption).toBeNull();
      expect(result.worstPerformingOption).toBeNull();
    });
  });

  describe('insights', () => {
    it('should provide insight for empty replay data', () => {
      const result = calculateTradeAgainAnalytics([]);

      expect(result.insight).toContain(
        "Start recording whether you'd take trades again"
      );
    });

    it('should compare best and worst options in insight', () => {
      const trades = [
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'yes', pnl: 100 }),
        createTrade({ wouldTakeTradeAgain: 'no', pnl: -50 }),
        createTrade({ wouldTakeTradeAgain: 'no', pnl: -50 }),
      ];
      const result = calculateTradeAgainAnalytics(trades);

      expect(result.insight).toContain('Yes');
      expect(result.insight).toContain('No');
      expect(result.insight).toContain('$150.00');
    });
  });
});
