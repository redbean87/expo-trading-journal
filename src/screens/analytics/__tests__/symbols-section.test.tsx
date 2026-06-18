import { render } from '@testing-library/react-native';
import React from 'react';

import { SymbolsSection } from '../symbols-section';

jest.mock('../../../hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      profit: '#4caf50',
      loss: '#f44336',
      border: '#e0e0e0',
      onSurface: '#000',
      textSecondary: '#666',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
  }),
}));

describe('SymbolsSection', () => {
  it('renders empty state when no symbols are provided', () => {
    const { getByText } = render(<SymbolsSection symbols={[]} />);

    expect(getByText('No trades in this period')).toBeTruthy();
  });

  it('renders all symbols in the list', () => {
    const symbols = [
      { symbol: 'AAPL', pnl: 150, totalShares: 20, pnlPercent: 7.5 },
      { symbol: 'TSLA', pnl: -30, totalShares: 5, pnlPercent: -3 },
    ];

    const { getByText } = render(<SymbolsSection symbols={symbols} />);

    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('TSLA')).toBeTruthy();
    expect(getByText('+150.00')).toBeTruthy();
    expect(getByText('-30.00')).toBeTruthy();
  });
});
