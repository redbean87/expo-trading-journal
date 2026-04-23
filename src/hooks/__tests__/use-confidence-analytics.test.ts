import { renderHook } from '@testing-library/react-native';

import { Trade } from '../../types';
import { useConfidenceAnalytics } from '../use-confidence-analytics';

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

describe('useConfidenceAnalytics', () => {
  it('should calculate correct analytics for trades with confidence', () => {
    const trades = [
      createTrade({ confidence: 1, pnl: -50 }),
      createTrade({ confidence: 1, pnl: -30 }),
      createTrade({ confidence: 2, pnl: 100 }),
      createTrade({ confidence: 3, pnl: 75 }),
    ];

    const { result } = renderHook(() => useConfidenceAnalytics(trades));

    expect(result.current.totalTradesWithConfidence).toBe(4);
    expect(result.current.byLevel[1].count).toBe(2);
    expect(result.current.byLevel[1].avgPnl).toBe(-40);
    expect(result.current.byLevel[2].avgPnl).toBe(100);
    expect(result.current.byLevel[3].avgPnl).toBe(75);
  });

  it('should handle empty trades array', () => {
    const { result } = renderHook(() => useConfidenceAnalytics([]));

    expect(result.current.totalTradesWithConfidence).toBe(0);
    expect(result.current.totalTradesWithoutConfidence).toBe(0);
    expect(result.current.bestPerformingLevel).toBeNull();
    expect(result.current.worstPerformingLevel).toBeNull();
    expect(result.current.insight).toContain('Start recording confidence');
  });

  it('should separate trades with and without confidence', () => {
    const trades = [
      createTrade({ confidence: 3, pnl: 100 }),
      createTrade({ confidence: undefined, pnl: 50 }),
      createTrade({ confidence: 4, pnl: 200 }),
      createTrade({ confidence: undefined, pnl: -25 }),
    ];

    const { result } = renderHook(() => useConfidenceAnalytics(trades));

    expect(result.current.totalTradesWithConfidence).toBe(2);
    expect(result.current.totalTradesWithoutConfidence).toBe(2);
  });
});
