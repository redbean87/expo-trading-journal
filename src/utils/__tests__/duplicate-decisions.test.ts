import { DuplicatePair } from '../../hooks/use-duplicate-detection';
import { DuplicateDecision, Trade } from '../../types';
import {
  filterPendingPairs,
  getDecisionForPair,
  isPairDecided,
  makeDuplicatePairKey,
} from '../duplicate-decisions';

function createMockTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: 'trade-1',
    symbol: 'AAPL',
    entryPrice: 100,
    exitPrice: 110,
    quantity: 10,
    entryTime: new Date('2024-01-01T10:00:00Z'),
    exitTime: new Date('2024-01-01T11:00:00Z'),
    side: 'long',
    pnl: 100,
    pnlPercent: 10,
    ...overrides,
  };
}

describe('duplicate-decisions utilities', () => {
  describe('makeDuplicatePairKey', () => {
    it('returns the same key regardless of id order', () => {
      expect(makeDuplicatePairKey('a', 'b')).toBe('a-b');
      expect(makeDuplicatePairKey('b', 'a')).toBe('a-b');
    });
  });

  describe('getDecisionForPair', () => {
    it('returns the matching decision for a pair', () => {
      const existing = createMockTrade({ id: 'existing-id' });
      const imported = createMockTrade({ id: 'imported-id' });
      const pair: DuplicatePair = { existing, imported };
      const decisions: DuplicateDecision[] = [
        {
          id: 'decision-1',
          tradeAId: 'existing-id',
          tradeBId: 'imported-id',
          pairKey: 'existing-id-imported-id',
          decision: 'keepBoth',
          decidedAt: Date.now(),
        },
      ];

      const result = getDecisionForPair(pair, decisions);

      expect(result).toBeDefined();
      expect(result?.decision).toBe('keepBoth');
    });

    it('returns undefined when no decision exists', () => {
      const pair: DuplicatePair = {
        existing: createMockTrade({ id: 'a' }),
        imported: createMockTrade({ id: 'b' }),
      };

      expect(getDecisionForPair(pair, [])).toBeUndefined();
    });
  });

  describe('isPairDecided', () => {
    it('returns true when a decision exists', () => {
      const pair: DuplicatePair = {
        existing: createMockTrade({ id: 'a' }),
        imported: createMockTrade({ id: 'b' }),
      };
      const decisions: DuplicateDecision[] = [
        {
          id: 'decision-1',
          tradeAId: 'a',
          tradeBId: 'b',
          pairKey: 'a-b',
          decision: 'keepBoth',
          decidedAt: Date.now(),
        },
      ];

      expect(isPairDecided(pair, decisions)).toBe(true);
    });

    it('returns false when no decision exists', () => {
      const pair: DuplicatePair = {
        existing: createMockTrade({ id: 'a' }),
        imported: createMockTrade({ id: 'b' }),
      };

      expect(isPairDecided(pair, [])).toBe(false);
    });
  });

  describe('filterPendingPairs', () => {
    it('returns all pairs when there are no decisions', () => {
      const pairs: DuplicatePair[] = [
        {
          existing: createMockTrade({ id: 'a' }),
          imported: createMockTrade({ id: 'b' }),
        },
      ];

      expect(filterPendingPairs(pairs, [])).toEqual(pairs);
    });

    it('filters out pairs that have a decision', () => {
      const pendingPair: DuplicatePair = {
        existing: createMockTrade({ id: 'pending-a' }),
        imported: createMockTrade({ id: 'pending-b' }),
      };
      const decidedPair: DuplicatePair = {
        existing: createMockTrade({ id: 'decided-a' }),
        imported: createMockTrade({ id: 'decided-b' }),
      };
      const decisions: DuplicateDecision[] = [
        {
          id: 'decision-1',
          tradeAId: 'decided-a',
          tradeBId: 'decided-b',
          pairKey: 'decided-a-decided-b',
          decision: 'keepBoth',
          decidedAt: Date.now(),
        },
      ];

      const result = filterPendingPairs([pendingPair, decidedPair], decisions);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(pendingPair);
    });
  });
});
