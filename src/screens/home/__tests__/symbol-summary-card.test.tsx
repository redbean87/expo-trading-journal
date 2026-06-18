import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { SymbolSummaryCard } from '../symbol-summary-card';

jest.mock('../../../hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      profit: '#4caf50',
      loss: '#f44336',
      primaryContainer: '#6200ee',
      border: '#e0e0e0',
      onSurface: '#000',
      textSecondary: '#666',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
  }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('SymbolSummaryCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders empty state when no symbols are provided', () => {
    const { getByText } = render(<SymbolSummaryCard summary={[]} />);

    expect(getByText('No trades in this period')).toBeTruthy();
  });

  it('splits symbols into top winners and top losers', () => {
    const summary = [
      { symbol: 'WIN1', pnl: 300, totalShares: 100, pnlPercent: 3 },
      { symbol: 'WIN2', pnl: 200, totalShares: 100, pnlPercent: 2 },
      { symbol: 'WIN3', pnl: 100, totalShares: 100, pnlPercent: 1 },
      { symbol: 'LOSE1', pnl: -100, totalShares: 100, pnlPercent: -1 },
      { symbol: 'LOSE2', pnl: -200, totalShares: 100, pnlPercent: -2 },
      { symbol: 'LOSE3', pnl: -300, totalShares: 100, pnlPercent: -3 },
    ];

    const { getByText } = render(<SymbolSummaryCard summary={summary} />);

    expect(getByText('Top Winners')).toBeTruthy();
    expect(getByText('Top Losers')).toBeTruthy();
    expect(getByText('WIN1')).toBeTruthy();
    expect(getByText('LOSE3')).toBeTruthy();
  });

  it('caps winners and losers at 3 each', () => {
    const summary = [
      { symbol: 'WIN1', pnl: 400, totalShares: 100, pnlPercent: 4 },
      { symbol: 'WIN2', pnl: 300, totalShares: 100, pnlPercent: 3 },
      { symbol: 'WIN3', pnl: 200, totalShares: 100, pnlPercent: 2 },
      { symbol: 'WIN4', pnl: 100, totalShares: 100, pnlPercent: 1 },
      { symbol: 'LOSE1', pnl: -100, totalShares: 100, pnlPercent: -1 },
      { symbol: 'LOSE2', pnl: -200, totalShares: 100, pnlPercent: -2 },
      { symbol: 'LOSE3', pnl: -300, totalShares: 100, pnlPercent: -3 },
      { symbol: 'LOSE4', pnl: -400, totalShares: 100, pnlPercent: -4 },
    ];

    const { queryByText } = render(<SymbolSummaryCard summary={summary} />);

    expect(queryByText('WIN4')).toBeNull();
    expect(queryByText('LOSE4')).toBeNull();
  });

  it('sorts losers by most negative first', () => {
    const summary = [
      { symbol: 'LOSE1', pnl: -100, totalShares: 100, pnlPercent: -1 },
      { symbol: 'LOSE2', pnl: -300, totalShares: 100, pnlPercent: -3 },
      { symbol: 'LOSE3', pnl: -200, totalShares: 100, pnlPercent: -2 },
    ];

    const { getAllByText } = render(<SymbolSummaryCard summary={summary} />);
    const symbols = getAllByText(/LOSE[123]/);

    expect(symbols[0].children?.[0]).toBe('LOSE2');
    expect(symbols[1].children?.[0]).toBe('LOSE3');
    expect(symbols[2].children?.[0]).toBe('LOSE1');
  });

  it('navigates to symbols analytics tab when View all is pressed', () => {
    const summary = [
      { symbol: 'AAPL', pnl: 100, totalShares: 100, pnlPercent: 1 },
    ];

    const { getByText } = render(<SymbolSummaryCard summary={summary} />);
    fireEvent.press(getByText('View all'));

    expect(mockPush).toHaveBeenCalledWith('/analytics/symbols');
  });
});
