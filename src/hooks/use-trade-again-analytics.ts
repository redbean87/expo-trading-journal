import { useMemo } from 'react';

import { Trade } from '../types';
import {
  TradeAgainAnalytics,
  TradeAgainOption,
  calculateTradeAgainAnalytics,
} from '../utils/trade-again-analytics';

export type { TradeAgainAnalytics, TradeAgainOption };

export function useTradeAgainAnalytics(trades: Trade[]): TradeAgainAnalytics {
  return useMemo(() => calculateTradeAgainAnalytics(trades), [trades]);
}
