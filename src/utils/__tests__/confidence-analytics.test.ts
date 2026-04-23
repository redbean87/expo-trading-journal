import { Trade } from '../../types';
import { calculateConfidenceAnalytics } from '../confidence-analytics';

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

describe('calculateConfidenceAnalytics', () => {
  describe('empty trades', () => {
    it('should return zero values for empty trades array', () => {
      const result = calculateConfidenceAnalytics([]);

      expect(result.totalTradesWithConfidence).toBe(0);
      expect(result.totalTradesWithoutConfidence).toBe(0);
      expect(result.bestPerformingLevel).toBeNull();
      expect(result.worstPerformingLevel).toBeNull();
      expect(result.overconfidenceDetected).toBe(false);
    });
  });

  describe('trades without confidence', () => {
    it('should count trades without confidence', () => {
      const trades = [
        createTrade({ confidence: undefined }),
        createTrade({ confidence: undefined }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.totalTradesWithConfidence).toBe(0);
      expect(result.totalTradesWithoutConfidence).toBe(2);
    });
  });

  describe('confidence level aggregation', () => {
    it('should aggregate trades by confidence level', () => {
      const trades = [
        createTrade({ confidence: 1, pnl: 50 }),
        createTrade({ confidence: 1, pnl: -30 }),
        createTrade({ confidence: 2, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 75 }),
        createTrade({ confidence: 4, pnl: 200 }),
        createTrade({ confidence: 5, pnl: 150 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.totalTradesWithConfidence).toBe(6);
      expect(result.byLevel[1].count).toBe(2);
      expect(result.byLevel[2].count).toBe(1);
      expect(result.byLevel[3].count).toBe(1);
      expect(result.byLevel[4].count).toBe(1);
      expect(result.byLevel[5].count).toBe(1);
    });

    it('should calculate win rate by confidence level', () => {
      const trades = [
        createTrade({ confidence: 3, pnl: 100 }), // win
        createTrade({ confidence: 3, pnl: 50 }), // win
        createTrade({ confidence: 3, pnl: -25 }), // loss
        createTrade({ confidence: 3, pnl: 0 }), // break-even
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.byLevel[3].count).toBe(4);
      expect(result.byLevel[3].wins).toBe(2);
      expect(result.byLevel[3].losses).toBe(1);
      expect(result.byLevel[3].winRate).toBe(50); // 2 wins / 4 total = 50%
    });

    it('should calculate average P&L by confidence level', () => {
      const trades = [
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: 200 }),
        createTrade({ confidence: 4, pnl: -50 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.byLevel[4].avgPnl).toBeCloseTo(83.33, 2); // (100 + 200 - 50) / 3
    });
  });

  describe('best and worst performing levels', () => {
    it('should identify best performing level by avg P&L (min 3 trades)', () => {
      const trades = [
        // Level 1: avg = 50 (only 2 trades, not enough)
        createTrade({ confidence: 1, pnl: 100 }),
        createTrade({ confidence: 1, pnl: 0 }),
        // Level 3: avg = 100 (3 trades, eligible)
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        // Level 5: avg = -100 (3 trades, eligible)
        createTrade({ confidence: 5, pnl: -100 }),
        createTrade({ confidence: 5, pnl: -100 }),
        createTrade({ confidence: 5, pnl: -100 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.bestPerformingLevel).toBe(3);
      expect(result.worstPerformingLevel).toBe(5);
    });

    it('should return null for best/worst when no level has 3+ trades', () => {
      const trades = [
        createTrade({ confidence: 1, pnl: 100 }),
        createTrade({ confidence: 2, pnl: 200 }),
        createTrade({ confidence: 3, pnl: 50 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.bestPerformingLevel).toBeNull();
      expect(result.worstPerformingLevel).toBeNull();
    });
  });

  describe('overconfidence detection', () => {
    it('should detect overconfidence when high confidence underperforms', () => {
      // High confidence (4-5) has low win rate compared to mid (level 3)
      const trades = [
        // Level 3: 80% win rate
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: -100 }),
        // Level 4: 25% win rate
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: -100 }),
        createTrade({ confidence: 4, pnl: -100 }),
        createTrade({ confidence: 4, pnl: -100 }),
        // Level 5: 25% win rate
        createTrade({ confidence: 5, pnl: 100 }),
        createTrade({ confidence: 5, pnl: -100 }),
        createTrade({ confidence: 5, pnl: -100 }),
        createTrade({ confidence: 5, pnl: -100 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.totalTradesWithConfidence).toBe(13);
      expect(result.byLevel[4].winRate).toBe(25);
      expect(result.byLevel[5].winRate).toBe(25);
      expect(result.byLevel[3].winRate).toBe(80);
      expect(result.overconfidenceDetected).toBe(true);
    });

    it('should not detect overconfidence when high confidence performs well', () => {
      const trades = [
        // Level 3: 60% win rate
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: -100 }),
        createTrade({ confidence: 3, pnl: -100 }),
        // Level 4: 80% win rate
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: -100 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.overconfidenceDetected).toBe(false);
    });

    it('should require at least 5 high-confidence trades to detect overconfidence', () => {
      const trades = [
        // Only 4 high confidence trades (need 5)
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: -100 }),
        createTrade({ confidence: 5, pnl: 100 }),
        createTrade({ confidence: 5, pnl: -100 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.overconfidenceDetected).toBe(false);
    });
  });

  describe('insights', () => {
    it('should provide insight for empty confidence data', () => {
      const result = calculateConfidenceAnalytics([]);

      expect(result.insight).toContain('Start recording confidence levels');
    });

    it('should provide insight when higher confidence correlates with better results', () => {
      const trades = [
        // Level 1: negative avg
        createTrade({ confidence: 1, pnl: -50 }),
        createTrade({ confidence: 1, pnl: -50 }),
        createTrade({ confidence: 1, pnl: -50 }),
        // Level 5: positive avg
        createTrade({ confidence: 5, pnl: 100 }),
        createTrade({ confidence: 5, pnl: 100 }),
        createTrade({ confidence: 5, pnl: 100 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.bestPerformingLevel).toBe(5);
      expect(result.worstPerformingLevel).toBe(1);
      expect(result.insight).toContain(
        'Higher confidence correlates with better results'
      );
    });

    it('should provide insight when lower confidence correlates with better results', () => {
      const trades = [
        // Level 1: positive avg
        createTrade({ confidence: 1, pnl: 100 }),
        createTrade({ confidence: 1, pnl: 100 }),
        createTrade({ confidence: 1, pnl: 100 }),
        // Level 5: negative avg
        createTrade({ confidence: 5, pnl: -50 }),
        createTrade({ confidence: 5, pnl: -50 }),
        createTrade({ confidence: 5, pnl: -50 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.bestPerformingLevel).toBe(1);
      expect(result.worstPerformingLevel).toBe(5);
      expect(result.insight).toContain('overthinking high-confidence setups');
    });

    it('should include overconfidence warning in insight when detected', () => {
      const trades = [
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: 100 }),
        createTrade({ confidence: 3, pnl: -100 }),
        createTrade({ confidence: 4, pnl: 100 }),
        createTrade({ confidence: 4, pnl: -100 }),
        createTrade({ confidence: 4, pnl: -100 }),
        createTrade({ confidence: 5, pnl: -100 }),
        createTrade({ confidence: 5, pnl: -100 }),
      ];
      const result = calculateConfidenceAnalytics(trades);

      expect(result.insight).toContain('Warning');
      expect(result.insight).toContain('High confidence');
    });
  });
});
