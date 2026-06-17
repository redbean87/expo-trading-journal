import { Trade } from '../../types';
import { findPotentialDuplicates } from '../use-duplicate-detection';

jest.mock('../use-duplicate-decisions', () => ({
  useDuplicateDecisions: () => ({ decisions: [], isLoading: false }),
}));

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

describe('findPotentialDuplicates', () => {
  it('flags trades with the same symbol and quantity within 10 seconds', () => {
    const existing = createMockTrade({
      id: 'existing',
      importedFrom: 'cash-balance',
      entryTime: new Date('2024-01-01T10:00:05Z'),
    });
    const imported = createMockTrade({
      id: 'imported',
      importedFrom: 'trade-history',
      entryTime: new Date('2024-01-01T10:00:10Z'),
    });

    const pairs = findPotentialDuplicates([existing, imported]);

    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toEqual({ existing, imported });
  });

  it('does not flag trades more than 10 seconds apart', () => {
    const existing = createMockTrade({
      id: 'existing',
      importedFrom: 'cash-balance',
      entryTime: new Date('2024-01-01T10:00:00Z'),
    });
    const imported = createMockTrade({
      id: 'imported',
      importedFrom: 'trade-history',
      entryTime: new Date('2024-01-01T10:00:11Z'),
    });

    const pairs = findPotentialDuplicates([existing, imported]);

    expect(pairs).toHaveLength(0);
  });

  it('does not flag trades with different symbols', () => {
    const existing = createMockTrade({
      id: 'existing',
      symbol: 'AAPL',
      importedFrom: 'cash-balance',
    });
    const imported = createMockTrade({
      id: 'imported',
      symbol: 'MSFT',
      importedFrom: 'trade-history',
    });

    const pairs = findPotentialDuplicates([existing, imported]);

    expect(pairs).toHaveLength(0);
  });

  it('does not flag trades with different quantities', () => {
    const existing = createMockTrade({
      id: 'existing',
      quantity: 10,
      importedFrom: 'cash-balance',
    });
    const imported = createMockTrade({
      id: 'imported',
      quantity: 20,
      importedFrom: 'trade-history',
    });

    const pairs = findPotentialDuplicates([existing, imported]);

    expect(pairs).toHaveLength(0);
  });

  it('does not flag manually entered trades', () => {
    const existing = createMockTrade({
      id: 'existing',
      importedFrom: undefined,
    });
    const imported = createMockTrade({
      id: 'imported',
      importedFrom: 'trade-history',
    });

    const pairs = findPotentialDuplicates([existing, imported]);

    expect(pairs).toHaveLength(0);
  });
});
