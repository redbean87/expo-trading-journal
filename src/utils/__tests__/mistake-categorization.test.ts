import { Trade } from '../../types';
import { calculateMistakeAnalytics } from '../mistake-categorization';

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

describe('calculateMistakeAnalytics', () => {
  describe('empty trades', () => {
    it('should return zero values for empty array', () => {
      const result = calculateMistakeAnalytics([]);

      expect(result.totalTradesWithMistakes).toBe(0);
      expect(result.totalTradesWithoutMistakes).toBe(0);
      expect(result.pnlWithMistakes).toBe(0);
      expect(result.pnlWithoutMistakes).toBe(0);
      expect(result.avgPnlWithMistakes).toBe(0);
      expect(result.avgPnlWithoutMistakes).toBe(0);
      expect(result.mistakesByCategory).toEqual([]);
      expect(result.topMistake).toBeNull();
      expect(result.costliestMistake).toBeNull();
    });
  });

  describe('trades without mistakes', () => {
    it('should correctly count trades without mistakes', () => {
      const trades = [
        createTrade({ pnl: 100 }),
        createTrade({ pnl: 50, id: '550e8400-e29b-41d4-a716-446655440001' }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.totalTradesWithMistakes).toBe(0);
      expect(result.totalTradesWithoutMistakes).toBe(2);
      expect(result.pnlWithoutMistakes).toBe(150);
      expect(result.avgPnlWithoutMistakes).toBe(75);
    });
  });

  describe('trades with mistakes', () => {
    it('should correctly count trades with mistakes', () => {
      const trades = [
        createTrade({ pnl: -100, ruleViolation: 'FOMO Entry' }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.totalTradesWithMistakes).toBe(2);
      expect(result.totalTradesWithoutMistakes).toBe(0);
      expect(result.pnlWithMistakes).toBe(-150);
      expect(result.avgPnlWithMistakes).toBe(-75);
    });

    it('should group trades by exact rule violation label', () => {
      const trades = [
        createTrade({
          pnl: -100,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -200,
          ruleViolation: 'No Valid Setup',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.mistakesByCategory.length).toBe(2);

      const fomoCategory = result.mistakesByCategory.find(
        (m) => m.label === 'FOMO Entry'
      );
      expect(fomoCategory).toBeDefined();
      expect(fomoCategory?.count).toBe(2);
      expect(fomoCategory?.totalPnl).toBe(-150);

      const noSetupCategory = result.mistakesByCategory.find(
        (m) => m.label === 'No Valid Setup'
      );
      expect(noSetupCategory).toBeDefined();
      expect(noSetupCategory?.count).toBe(1);
      expect(noSetupCategory?.totalPnl).toBe(-200);
    });

    it('should treat different labels as separate categories', () => {
      const trades = [
        createTrade({
          pnl: -100,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -200,
          ruleViolation: 'Oversized Position',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.mistakesByCategory.length).toBe(2);
    });
  });

  describe('mixed trades', () => {
    it('should separate trades with and without mistakes', () => {
      const trades = [
        createTrade({
          pnl: 100,
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -100,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: 50,
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.totalTradesWithMistakes).toBe(1);
      expect(result.totalTradesWithoutMistakes).toBe(2);
      expect(result.pnlWithMistakes).toBe(-100);
      expect(result.pnlWithoutMistakes).toBe(150);
    });
  });

  describe('top and costliest mistake', () => {
    it('should identify top mistake by frequency', () => {
      const trades = [
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -500,
          ruleViolation: 'No Valid Setup',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.topMistake?.label).toBe('FOMO Entry');
      expect(result.topMistake?.count).toBe(2);
    });

    it('should identify costliest mistake by total P&L', () => {
      const trades = [
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -500,
          ruleViolation: 'No Valid Setup',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.costliestMistake?.label).toBe('No Valid Setup');
      expect(result.costliestMistake?.totalPnl).toBe(-500);
    });
  });

  describe('win rate calculation', () => {
    it('should calculate win rate per category', () => {
      const trades = [
        createTrade({
          pnl: 100,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      const fomoCategory = result.mistakesByCategory.find(
        (m) => m.label === 'FOMO Entry'
      );
      expect(fomoCategory?.winRate).toBe(50);
    });

    it('should handle all losing trades', () => {
      const trades = [
        createTrade({
          pnl: -100,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      const fomoCategory = result.mistakesByCategory.find(
        (m) => m.label === 'FOMO Entry'
      );
      expect(fomoCategory?.winRate).toBe(0);
    });
  });

  describe('sorting', () => {
    it('should sort categories by count descending', () => {
      const trades = [
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO Entry',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
        createTrade({
          pnl: -100,
          ruleViolation: 'No Valid Setup',
          id: '550e8400-e29b-41d4-a716-446655440004',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.mistakesByCategory[0].label).toBe('FOMO Entry');
      expect(result.mistakesByCategory[0].count).toBe(3);
      expect(result.mistakesByCategory[1].label).toBe('No Valid Setup');
      expect(result.mistakesByCategory[1].count).toBe(1);
    });
  });
});
