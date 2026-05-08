import { render } from '@testing-library/react-native';
import React from 'react';

import { Trade } from '../../../types';
import { ConfidenceCard } from '../confidence-card';

// Mock the useAppTheme hook
jest.mock('../../../hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      profit: '#4caf50',
      loss: '#f44336',
      textSecondary: '#666666',
      textTertiary: '#999999',
      surfaceVariant: '#f5f5f5',
      border: '#e0e0e0',
      primary: '#6200ee',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      md: 8,
    },
    iconSizes: {
      sm: 24,
    },
  }),
}));

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

describe('ConfidenceCard', () => {
  it('should show empty state when no trades have setup quality data', () => {
    const trades = [
      createTrade({ setupQuality: undefined }),
      createTrade({ setupQuality: undefined }),
    ];

    const { getByText } = render(<ConfidenceCard trades={trades} />);

    expect(getByText('No setup quality data yet')).toBeTruthy();
    expect(
      getByText(
        'Start rating your setup quality (1-5) on trades to analyze how pre-trade assessment correlates with performance'
      )
    ).toBeTruthy();
  });

  it('should show empty state for empty trades array', () => {
    const { getByText } = render(<ConfidenceCard trades={[]} />);

    expect(getByText('No setup quality data yet')).toBeTruthy();
  });

  it('should display analytics when setup quality data exists', () => {
    const trades = [
      createTrade({ setupQuality: 1, pnl: -50 }),
      createTrade({ setupQuality: 1, pnl: -30 }),
      createTrade({ setupQuality: 2, pnl: 100 }),
      createTrade({ setupQuality: 3, pnl: 75 }),
    ];

    const { getByText } = render(<ConfidenceCard trades={trades} />);

    expect(getByText('Setup Quality Analysis')).toBeTruthy();
    expect(getByText('Trades with Setup Quality Rating:')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('Performance by Setup Quality Level')).toBeTruthy();
  });

  it('should display trades without setup quality count when applicable', () => {
    const trades = [
      createTrade({ setupQuality: 3, pnl: 100 }),
      createTrade({ setupQuality: undefined, pnl: 50 }),
    ];

    const { getByText } = render(<ConfidenceCard trades={trades} />);

    expect(getByText('Trades without Rating:')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('should display setup quality level breakdown rows', () => {
    const trades = [
      createTrade({ setupQuality: 3, pnl: 100 }),
      createTrade({ setupQuality: 3, pnl: 50 }),
      createTrade({ setupQuality: 4, pnl: 200 }),
    ];

    const { getByText } = render(<ConfidenceCard trades={trades} />);

    // Should show Level 3
    expect(getByText('Level 3')).toBeTruthy();
    // Should show Level 4
    expect(getByText('Level 4')).toBeTruthy();
  });

  it('should not display levels with no trades', () => {
    const trades = [createTrade({ setupQuality: 3, pnl: 100 })];

    const { queryByText } = render(<ConfidenceCard trades={trades} />);

    expect(queryByText('Level 1')).toBeNull();
    expect(queryByText('Level 2')).toBeNull();
    expect(queryByText('Level 4')).toBeNull();
    expect(queryByText('Level 5')).toBeNull();
  });
});
