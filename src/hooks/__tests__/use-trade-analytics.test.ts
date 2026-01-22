import { Trade } from '../../types';
import {
  calculateTradeAnalytics,
  calculateStreaks,
} from '../use-trade-analytics';

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

describe('calculateStreaks', () => {
  it('should return zeros for empty trades', () => {
    const result = calculateStreaks([]);
    expect(result.maxWins).toBe(0);
    expect(result.maxLosses).toBe(0);
  });

  it('should count consecutive wins', () => {
    const trades = [
      createTrade({ pnl: 100, exitTime: new Date('2024-01-01') }),
      createTrade({ pnl: 50, exitTime: new Date('2024-01-02') }),
      createTrade({ pnl: 75, exitTime: new Date('2024-01-03') }),
    ];
    const result = calculateStreaks(trades);
    expect(result.maxWins).toBe(3);
    expect(result.maxLosses).toBe(0);
  });

  it('should count consecutive losses', () => {
    const trades = [
      createTrade({ pnl: -100, exitTime: new Date('2024-01-01') }),
      createTrade({ pnl: -50, exitTime: new Date('2024-01-02') }),
    ];
    const result = calculateStreaks(trades);
    expect(result.maxWins).toBe(0);
    expect(result.maxLosses).toBe(2);
  });

  it('should handle mixed wins and losses', () => {
    const trades = [
      createTrade({ pnl: 100, exitTime: new Date('2024-01-01') }),
      createTrade({ pnl: 50, exitTime: new Date('2024-01-02') }),
      createTrade({ pnl: -25, exitTime: new Date('2024-01-03') }),
      createTrade({ pnl: -30, exitTime: new Date('2024-01-04') }),
      createTrade({ pnl: -10, exitTime: new Date('2024-01-05') }),
      createTrade({ pnl: 200, exitTime: new Date('2024-01-06') }),
    ];
    const result = calculateStreaks(trades);
    expect(result.maxWins).toBe(2);
    expect(result.maxLosses).toBe(3);
  });

  it('should reset streak on break-even trade', () => {
    const trades = [
      createTrade({ pnl: 100, exitTime: new Date('2024-01-01') }),
      createTrade({ pnl: 0, exitTime: new Date('2024-01-02') }),
      createTrade({ pnl: 50, exitTime: new Date('2024-01-03') }),
    ];
    const result = calculateStreaks(trades);
    expect(result.maxWins).toBe(1);
  });
});

describe('calculateTradeAnalytics', () => {
  describe('empty trades', () => {
    it('should return zero values for empty trades array', () => {
      const result = calculateTradeAnalytics([]);

      expect(result.totalTrades).toBe(0);
      expect(result.winRate).toBe(0);
      expect(result.totalPnl).toBe(0);
      expect(result.avgWin).toBe(0);
      expect(result.avgLoss).toBe(0);
      expect(result.realizedRR).toBe(0);
      expect(result.expectedValue).toBe(0);
      expect(result.requiredWinRate).toBe(0);
      expect(result.bestTrade).toBeNull();
      expect(result.worstTrade).toBeNull();
    });
  });

  describe('basic metrics', () => {
    it('should calculate win rate correctly', () => {
      const trades = [
        createTrade({ pnl: 100 }),
        createTrade({ pnl: 50 }),
        createTrade({ pnl: -25 }),
        createTrade({ pnl: -75 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.totalTrades).toBe(4);
      expect(result.winningTrades.length).toBe(2);
      expect(result.losingTrades.length).toBe(2);
      expect(result.winRate).toBe(50);
    });

    it('should calculate avg win and avg loss', () => {
      const trades = [
        createTrade({ pnl: 100 }),
        createTrade({ pnl: 200 }),
        createTrade({ pnl: -50 }),
        createTrade({ pnl: -100 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.avgWin).toBe(150); // (100 + 200) / 2
      expect(result.avgLoss).toBe(75); // (50 + 100) / 2
    });

    it('should identify best and worst trades', () => {
      const trades = [
        createTrade({ id: '1', pnl: 100 }),
        createTrade({ id: '2', pnl: 500 }),
        createTrade({ id: '3', pnl: -200 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.bestTrade?.id).toBe('2');
      expect(result.largestGain).toBe(500);
      expect(result.worstTrade?.id).toBe('3');
      expect(result.largestLoss).toBe(200);
    });
  });

  describe('R:R metrics', () => {
    it('should calculate realized R:R ratio', () => {
      const trades = [
        createTrade({ pnl: 150 }),
        createTrade({ pnl: 150 }),
        createTrade({ pnl: -100 }),
        createTrade({ pnl: -100 }),
      ];
      const result = calculateTradeAnalytics(trades);

      // avgWin = 150, avgLoss = 100, R:R = 1.5
      expect(result.realizedRR).toBe(1.5);
    });

    it('should return Infinity for R:R when no losses', () => {
      const trades = [createTrade({ pnl: 100 }), createTrade({ pnl: 200 })];
      const result = calculateTradeAnalytics(trades);

      expect(result.realizedRR).toBe(Infinity);
    });

    it('should return 0 for R:R when no wins', () => {
      const trades = [createTrade({ pnl: -100 }), createTrade({ pnl: -50 })];
      const result = calculateTradeAnalytics(trades);

      expect(result.realizedRR).toBe(0);
    });

    it('should calculate expected value', () => {
      // 50% win rate, avgWin = 150, avgLoss = 100
      // EV = (0.5 * 150) - (0.5 * 100) = 75 - 50 = 25
      const trades = [
        createTrade({ pnl: 150 }),
        createTrade({ pnl: 150 }),
        createTrade({ pnl: -100 }),
        createTrade({ pnl: -100 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.expectedValue).toBe(25);
    });

    it('should calculate required win rate for breakeven', () => {
      // R:R = 1.5, required win rate = 1 / (1 + 1.5) = 40%
      const trades = [
        createTrade({ pnl: 150 }),
        createTrade({ pnl: 150 }),
        createTrade({ pnl: -100 }),
        createTrade({ pnl: -100 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.requiredWinRate).toBe(40);
    });

    it('should return 0 required win rate when R:R is Infinity', () => {
      const trades = [createTrade({ pnl: 100 })];
      const result = calculateTradeAnalytics(trades);

      expect(result.requiredWinRate).toBe(0);
    });
  });

  describe('side-specific analytics', () => {
    it('should separate long and short trades', () => {
      const trades = [
        createTrade({ side: 'long', pnl: 100 }),
        createTrade({ side: 'long', pnl: -50 }),
        createTrade({ side: 'short', pnl: 200 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.longTrades.length).toBe(2);
      expect(result.shortTrades.length).toBe(1);
      expect(result.longPnl).toBe(50);
      expect(result.shortPnl).toBe(200);
    });

    it('should calculate long-specific R:R', () => {
      const trades = [
        createTrade({ side: 'long', pnl: 200 }),
        createTrade({ side: 'long', pnl: -100 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.longAvgWin).toBe(200);
      expect(result.longAvgLoss).toBe(100);
      expect(result.longRR).toBe(2);
      expect(result.longWinRate).toBe(50);
    });

    it('should calculate short-specific R:R', () => {
      const trades = [
        createTrade({ side: 'short', pnl: 300 }),
        createTrade({ side: 'short', pnl: 300 }),
        createTrade({ side: 'short', pnl: -150 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.shortAvgWin).toBe(300);
      expect(result.shortAvgLoss).toBe(150);
      expect(result.shortRR).toBe(2);
      expect(result.shortWinRate).toBeCloseTo(66.67, 1);
    });

    it('should return Infinity for side R:R when no losses on that side', () => {
      const trades = [
        createTrade({ side: 'long', pnl: 100 }),
        createTrade({ side: 'short', pnl: -50 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.longRR).toBe(Infinity);
      expect(result.shortRR).toBe(0);
    });

    it('should return 0 for side metrics when no trades on that side', () => {
      const trades = [createTrade({ side: 'long', pnl: 100 })];
      const result = calculateTradeAnalytics(trades);

      expect(result.shortWinRate).toBe(0);
      expect(result.shortAvgWin).toBe(0);
      expect(result.shortAvgLoss).toBe(0);
      expect(result.shortRR).toBe(0);
    });
  });

  describe('hold time calculation', () => {
    it('should calculate average hold time', () => {
      const trades = [
        createTrade({
          entryTime: new Date('2024-01-01T10:00:00'),
          exitTime: new Date('2024-01-01T14:00:00'), // 4 hours
        }),
        createTrade({
          entryTime: new Date('2024-01-02T09:00:00'),
          exitTime: new Date('2024-01-02T11:00:00'), // 2 hours
        }),
      ];
      const result = calculateTradeAnalytics(trades);

      const threeHoursMs = 3 * 60 * 60 * 1000;
      expect(result.avgHoldTimeMs).toBe(threeHoursMs);
    });
  });

  describe('break-even trades', () => {
    it('should identify break-even trades', () => {
      const trades = [
        createTrade({ pnl: 100 }),
        createTrade({ pnl: 0 }),
        createTrade({ pnl: -50 }),
      ];
      const result = calculateTradeAnalytics(trades);

      expect(result.breakEvenTrades.length).toBe(1);
      expect(result.winningTrades.length).toBe(1);
      expect(result.losingTrades.length).toBe(1);
    });
  });
});
