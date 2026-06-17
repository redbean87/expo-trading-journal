import { DuplicatePair } from '../../hooks/use-duplicate-detection';
import { Trade } from '../../types';
import { useDuplicateReviewStore } from '../duplicate-review-store';

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

describe('useDuplicateReviewStore', () => {
  beforeEach(() => {
    useDuplicateReviewStore.setState({
      pairs: [],
      isReviewActive: false,
    });
  });

  describe('setPairs', () => {
    it('sets the review pairs', () => {
      const pairs: DuplicatePair[] = [
        {
          existing: createMockTrade({ id: 'existing' }),
          imported: createMockTrade({ id: 'imported' }),
        },
      ];

      useDuplicateReviewStore.getState().setPairs(pairs);

      expect(useDuplicateReviewStore.getState().pairs).toEqual(pairs);
    });
  });

  describe('removePair', () => {
    it('removes a matching pair', () => {
      const pairs: DuplicatePair[] = [
        {
          existing: createMockTrade({ id: 'a' }),
          imported: createMockTrade({ id: 'b' }),
        },
      ];

      useDuplicateReviewStore.getState().setPairs(pairs);
      useDuplicateReviewStore.getState().removePair('a', 'b');

      expect(useDuplicateReviewStore.getState().pairs).toHaveLength(0);
    });

    it('removes a pair regardless of id order', () => {
      const pairs: DuplicatePair[] = [
        {
          existing: createMockTrade({ id: 'a' }),
          imported: createMockTrade({ id: 'b' }),
        },
      ];

      useDuplicateReviewStore.getState().setPairs(pairs);
      useDuplicateReviewStore.getState().removePair('b', 'a');

      expect(useDuplicateReviewStore.getState().pairs).toHaveLength(0);
    });

    it('does not remove non-matching pairs', () => {
      const pairs: DuplicatePair[] = [
        {
          existing: createMockTrade({ id: 'a' }),
          imported: createMockTrade({ id: 'b' }),
        },
      ];

      useDuplicateReviewStore.getState().setPairs(pairs);
      useDuplicateReviewStore.getState().removePair('a', 'c');

      expect(useDuplicateReviewStore.getState().pairs).toHaveLength(1);
    });
  });

  describe('clearPairs', () => {
    it('clears pairs and ends review', () => {
      const pairs: DuplicatePair[] = [
        {
          existing: createMockTrade({ id: 'a' }),
          imported: createMockTrade({ id: 'b' }),
        },
      ];

      useDuplicateReviewStore.getState().setPairs(pairs);
      useDuplicateReviewStore.getState().startReview();
      useDuplicateReviewStore.getState().clearPairs();

      expect(useDuplicateReviewStore.getState().pairs).toHaveLength(0);
      expect(useDuplicateReviewStore.getState().isReviewActive).toBe(false);
    });
  });
});
