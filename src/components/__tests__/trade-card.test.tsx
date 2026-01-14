import {
  render,
  fireEvent,
  UNSAFE_getByType,
} from '@testing-library/react-native';
import { Card } from 'react-native-paper';

import { Trade } from '../../types';
import { TradeCard } from '../trade-card';

// Mock the hooks
jest.mock('../../hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      profit: '#4caf50',
      loss: '#f44336',
      textSecondary: '#666',
      primary: '#6200ee',
      border: '#e0e0e0',
    },
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

const mockTrade: Trade = {
  id: 'test-trade-123',
  symbol: 'AAPL',
  entryPrice: 150,
  exitPrice: 160,
  quantity: 10,
  entryTime: new Date('2024-01-15T10:00:00Z'),
  exitTime: new Date('2024-01-15T14:00:00Z'),
  side: 'long',
  pnl: 100,
  pnlPercent: 6.67,
  strategy: 'Momentum',
};

describe('TradeCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('navigation behavior', () => {
    it('should call router.push with trade detail route when pressed', () => {
      const { UNSAFE_root } = render(
        <TradeCard trade={mockTrade} disableNavigation={false} />
      );
      const card = UNSAFE_getByType(UNSAFE_root, Card);

      fireEvent.press(card);

      expect(mockPush).toHaveBeenCalledWith('/trade/test-trade-123');
    });

    it('should not navigate when disableNavigation is true', () => {
      const { UNSAFE_root } = render(
        <TradeCard trade={mockTrade} disableNavigation={true} />
      );
      const card = UNSAFE_getByType(UNSAFE_root, Card);

      fireEvent.press(card);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should navigate with correct trade id', () => {
      const tradeWithDifferentId = { ...mockTrade, id: 'different-id-456' };
      const { UNSAFE_root } = render(
        <TradeCard trade={tradeWithDifferentId} disableNavigation={false} />
      );
      const card = UNSAFE_getByType(UNSAFE_root, Card);

      fireEvent.press(card);

      expect(mockPush).toHaveBeenCalledWith('/trade/different-id-456');
    });
  });
});
