import { Trade } from '../../types';
import {
  categorizeMistake,
  calculateMistakeAnalytics,
} from '../mistake-categorization';

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

describe('categorizeMistake', () => {
  describe('empty input', () => {
    it('should return null for undefined', () => {
      expect(categorizeMistake(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(categorizeMistake('')).toBeNull();
    });

    it('should return null for whitespace only', () => {
      expect(categorizeMistake('   ')).toBeNull();
    });
  });

  describe('early exit category', () => {
    it('should match "exited too early"', () => {
      expect(categorizeMistake('exited too early')).toBe('early_exit');
    });

    it('should match "exit early" case insensitive', () => {
      expect(categorizeMistake('I decided to EXIT EARLY')).toBe('early_exit');
    });

    it('should match "got out early"', () => {
      expect(categorizeMistake('got out early and missed the move')).toBe(
        'early_exit'
      );
    });
  });

  describe('late exit category', () => {
    it('should match "held too long"', () => {
      expect(categorizeMistake('held too long')).toBe('late_exit');
    });

    it('should match "exited too late"', () => {
      expect(categorizeMistake('exited too late')).toBe('late_exit');
    });
  });

  describe('no setup category', () => {
    it('should match "no setup"', () => {
      expect(categorizeMistake('no setup was present')).toBe('no_setup');
    });

    it('should match "not setup"', () => {
      expect(categorizeMistake('ORB not setup correctly')).toBe('no_setup');
    });

    it('should match "no pattern"', () => {
      expect(categorizeMistake('there was no pattern')).toBe('no_setup');
    });
  });

  describe('oversize category', () => {
    it('should match "oversize"', () => {
      expect(categorizeMistake('oversize position')).toBe('oversize');
    });

    it('should match "too big"', () => {
      expect(categorizeMistake('position was too big')).toBe('oversize');
    });

    it('should match "too much size"', () => {
      expect(categorizeMistake('took too much size')).toBe('oversize');
    });
  });

  describe('fomo category', () => {
    it('should match "fomo"', () => {
      expect(categorizeMistake('FOMO entry')).toBe('fomo');
    });

    it('should match "chased"', () => {
      expect(categorizeMistake('chased the move')).toBe('fomo');
    });

    it('should match "chasing"', () => {
      expect(categorizeMistake('was chasing price')).toBe('fomo');
    });
  });

  describe('revenge category', () => {
    it('should match "revenge"', () => {
      expect(categorizeMistake('revenge trade after loss')).toBe('revenge');
    });

    it('should match "tilted"', () => {
      expect(categorizeMistake('was tilted from previous trade')).toBe(
        'revenge'
      );
    });

    it('should match "tilt"', () => {
      expect(categorizeMistake('entered on tilt')).toBe('revenge');
    });
  });

  describe('no stop category', () => {
    it('should match "no stop"', () => {
      expect(categorizeMistake('no stop loss')).toBe('no_stop');
    });

    it('should match "no stoploss"', () => {
      expect(categorizeMistake('traded without no stoploss')).toBe('no_stop');
    });
  });

  describe('moved stop category', () => {
    it('should match "moved stop"', () => {
      expect(categorizeMistake('moved stop loss down')).toBe('moved_stop');
    });

    it('should match "widened stop"', () => {
      expect(categorizeMistake('widened stop')).toBe('moved_stop');
    });
  });

  describe('wrong direction category', () => {
    it('should match "wrong direction"', () => {
      expect(categorizeMistake('wrong direction, should have shorted')).toBe(
        'wrong_direction'
      );
    });

    it('should match "wrong side"', () => {
      expect(categorizeMistake('wrong side of the trade')).toBe(
        'wrong_direction'
      );
    });
  });

  describe('poor timing category', () => {
    it('should match "poor timing"', () => {
      expect(categorizeMistake('poor timing on entry')).toBe('poor_timing');
    });

    it('should match "bad entry"', () => {
      expect(categorizeMistake('bad entry point')).toBe('poor_timing');
    });

    it('should match "entered too early"', () => {
      expect(categorizeMistake('entered too early')).toBe('poor_timing');
    });
  });

  describe('ignored rules category', () => {
    it('should match "ignored rule"', () => {
      expect(categorizeMistake('ignored rule about sizing')).toBe(
        'ignored_rules'
      );
    });

    it('should match "broke rule"', () => {
      expect(
        categorizeMistake('broke rule about not trading first 5 min')
      ).toBe('ignored_rules');
    });

    it('should match "broke my rule"', () => {
      expect(categorizeMistake('broke my rule')).toBe('ignored_rules');
    });
  });

  describe('other category', () => {
    it('should return "other" for unmatched text', () => {
      expect(categorizeMistake('some random mistake')).toBe('other');
    });

    it('should return "other" for generic text', () => {
      expect(categorizeMistake('made an error')).toBe('other');
    });
  });
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
        createTrade({ pnl: -100, ruleViolation: 'FOMO entry' }),
        createTrade({
          pnl: -50,
          ruleViolation: 'chased the move',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.totalTradesWithMistakes).toBe(2);
      expect(result.totalTradesWithoutMistakes).toBe(0);
      expect(result.pnlWithMistakes).toBe(-150);
      expect(result.avgPnlWithMistakes).toBe(-75);
    });

    it('should group trades by mistake category', () => {
      const trades = [
        createTrade({
          pnl: -100,
          ruleViolation: 'FOMO entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'chased the move',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -200,
          ruleViolation: 'no setup',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.mistakesByCategory.length).toBe(2);

      const fomoCategory = result.mistakesByCategory.find(
        (m) => m.categoryId === 'fomo'
      );
      expect(fomoCategory).toBeDefined();
      expect(fomoCategory?.count).toBe(2);
      expect(fomoCategory?.totalPnl).toBe(-150);

      const noSetupCategory = result.mistakesByCategory.find(
        (m) => m.categoryId === 'no_setup'
      );
      expect(noSetupCategory).toBeDefined();
      expect(noSetupCategory?.count).toBe(1);
      expect(noSetupCategory?.totalPnl).toBe(-200);
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
          ruleViolation: 'FOMO entry',
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
          ruleViolation: 'FOMO',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'chased',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -500,
          ruleViolation: 'no setup',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.topMistake?.categoryId).toBe('fomo');
      expect(result.topMistake?.count).toBe(2);
    });

    it('should identify costliest mistake by total P&L', () => {
      const trades = [
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'chased',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -500,
          ruleViolation: 'no setup',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.costliestMistake?.categoryId).toBe('no_setup');
      expect(result.costliestMistake?.totalPnl).toBe(-500);
    });
  });

  describe('win rate calculation', () => {
    it('should calculate win rate per category', () => {
      const trades = [
        createTrade({
          pnl: 100,
          ruleViolation: 'FOMO entry',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO chased',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      const fomoCategory = result.mistakesByCategory.find(
        (m) => m.categoryId === 'fomo'
      );
      expect(fomoCategory?.winRate).toBe(50);
    });

    it('should handle all losing trades', () => {
      const trades = [
        createTrade({
          pnl: -100,
          ruleViolation: 'FOMO',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      const fomoCategory = result.mistakesByCategory.find(
        (m) => m.categoryId === 'fomo'
      );
      expect(fomoCategory?.winRate).toBe(0);
    });
  });

  describe('sorting', () => {
    it('should sort categories by count descending', () => {
      const trades = [
        createTrade({
          pnl: -50,
          ruleViolation: 'FOMO',
          id: '550e8400-e29b-41d4-a716-446655440001',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'chased',
          id: '550e8400-e29b-41d4-a716-446655440002',
        }),
        createTrade({
          pnl: -50,
          ruleViolation: 'chasing',
          id: '550e8400-e29b-41d4-a716-446655440003',
        }),
        createTrade({
          pnl: -100,
          ruleViolation: 'no setup',
          id: '550e8400-e29b-41d4-a716-446655440004',
        }),
      ];
      const result = calculateMistakeAnalytics(trades);

      expect(result.mistakesByCategory[0].categoryId).toBe('fomo');
      expect(result.mistakesByCategory[0].count).toBe(3);
      expect(result.mistakesByCategory[1].categoryId).toBe('no_setup');
      expect(result.mistakesByCategory[1].count).toBe(1);
    });
  });
});
