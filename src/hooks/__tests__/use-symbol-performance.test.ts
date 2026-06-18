import { Trade } from '../../types';
import { useSymbolPerformance } from '../use-symbol-performance';

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

describe('useSymbolPerformance', () => {
  it('groups trades by symbol and sums pnl and shares', () => {
    const aapl1 = createTrade({
      id: '1',
      symbol: 'AAPL',
      pnl: 100,
      pnlPercent: 10,
      quantity: 10,
    });
    const aapl2 = createTrade({
      id: '2',
      symbol: 'AAPL',
      pnl: 50,
      pnlPercent: 5,
      quantity: 10,
    });
    const tsla = createTrade({
      id: '3',
      symbol: 'TSLA',
      pnl: -30,
      pnlPercent: -3,
      quantity: 5,
    });

    const result = useSymbolPerformance([aapl1, aapl2, tsla]);

    expect(result).toEqual([
      { symbol: 'AAPL', pnl: 150, totalShares: 20, pnlPercent: 7.5 },
      { symbol: 'TSLA', pnl: -30, totalShares: 5, pnlPercent: -3 },
    ]);
  });

  it('sorts symbols by pnl descending', () => {
    const nvda = createTrade({ id: '1', symbol: 'NVDA', pnl: 50 });
    const aapl = createTrade({ id: '2', symbol: 'AAPL', pnl: 200 });
    const msft = createTrade({ id: '3', symbol: 'MSFT', pnl: -20 });

    const result = useSymbolPerformance([nvda, aapl, msft]);

    expect(result.map((s) => s.symbol)).toEqual(['AAPL', 'NVDA', 'MSFT']);
  });

  it('calculates quantity-weighted percent return', () => {
    const aapl1 = createTrade({
      id: '1',
      symbol: 'AAPL',
      pnlPercent: 10,
      quantity: 1,
    });
    const aapl2 = createTrade({
      id: '2',
      symbol: 'AAPL',
      pnlPercent: 4,
      quantity: 2,
    });

    const result = useSymbolPerformance([aapl1, aapl2]);

    expect(result[0].pnlPercent).toBe(6);
    expect(result[0].totalShares).toBe(3);
  });

  it('returns empty array when no trades are provided', () => {
    const result = useSymbolPerformance([]);

    expect(result).toEqual([]);
  });
});
