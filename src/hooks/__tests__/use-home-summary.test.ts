import { Trade } from '../../types';
import { useHomeSummary } from '../use-home-summary';

// useHomeSummary is a hook but its logic is pure — test via direct call
// (no renderHook needed since useMemo is the only hook dependency)
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useMemo: (fn: () => unknown) => fn(),
}));

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

const today = new Date();
const todayTrade = createTrade({
  exitTime: new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
    0,
    0
  ),
});
const oldTrade = createTrade({
  exitTime: new Date('2020-01-01T12:00:00'),
  pnl: 50,
});

describe('useHomeSummary', () => {
  describe('period filtering', () => {
    it('all period returns stats for all trades', () => {
      const trades = [todayTrade, oldTrade];
      const result = useHomeSummary(trades, 'all');
      expect(result.totalTrades).toBe(2);
    });

    it('today period filters to only today trades', () => {
      const trades = [todayTrade, oldTrade];
      const result = useHomeSummary(trades, 'today');
      expect(result.totalTrades).toBe(1);
    });

    it('today period with no trades today returns zero stats', () => {
      const result = useHomeSummary([oldTrade], 'today');
      expect(result.totalTrades).toBe(0);
      expect(result.totalPnl).toBe(0);
      expect(result.winRate).toBe(0);
    });
  });

  describe('recentTrades is always unfiltered', () => {
    it('recent trades does not change when period changes', () => {
      const trades = [todayTrade, oldTrade];
      const allResult = useHomeSummary(trades, 'all');
      const todayResult = useHomeSummary(trades, 'today');
      expect(allResult.recentTrades).toHaveLength(2);
      expect(todayResult.recentTrades).toHaveLength(2);
    });

    it('recent trades is capped at 5', () => {
      const trades = Array.from({ length: 10 }, (_, i) =>
        createTrade({ id: String(i) })
      );
      const result = useHomeSummary(trades, 'all');
      expect(result.recentTrades).toHaveLength(5);
    });
  });

  describe('streak reflects filtered period', () => {
    it('streak is none when no trades in period', () => {
      const result = useHomeSummary([oldTrade], 'today');
      expect(result.currentStreak).toEqual({ count: 0, type: 'none' });
    });

    it('streak reflects today trades only', () => {
      const winToday = { ...todayTrade, pnl: 100 };
      const lossOld = { ...oldTrade, pnl: -50 };
      const result = useHomeSummary([winToday, lossOld], 'today');
      expect(result.currentStreak).toEqual({ count: 1, type: 'win' });
    });
  });

  describe('custom range filtering', () => {
    it('filters trades within custom start and end', () => {
      const midTrade = createTrade({
        exitTime: new Date('2024-06-01T12:00:00'),
      });
      const earlyTrade = createTrade({
        exitTime: new Date('2024-01-01T12:00:00'),
      });
      const lateTrade = createTrade({
        exitTime: new Date('2024-12-01T12:00:00'),
      });
      const trades = [earlyTrade, midTrade, lateTrade];

      const result = useHomeSummary(
        trades,
        'custom',
        new Date('2024-03-01').getTime(),
        new Date('2024-09-01').getTime()
      );
      expect(result.totalTrades).toBe(1);
      expect(result.recentTrades).toHaveLength(3);
    });

    it('custom range with no end filters from start onwards', () => {
      const midTrade = createTrade({
        exitTime: new Date('2024-06-01T12:00:00'),
      });
      const earlyTrade = createTrade({
        exitTime: new Date('2024-01-01T12:00:00'),
      });
      const trades = [earlyTrade, midTrade];

      const result = useHomeSummary(
        trades,
        'custom',
        new Date('2024-03-01').getTime(),
        null
      );
      expect(result.totalTrades).toBe(1);
    });
  });
});
