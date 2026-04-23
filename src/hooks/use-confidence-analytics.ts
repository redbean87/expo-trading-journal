import { useMemo } from 'react';

import { Trade } from '../types';
import {
  ConfidenceAnalytics,
  ConfidenceLevel,
  calculateConfidenceAnalytics,
} from '../utils/confidence-analytics';

export type { ConfidenceAnalytics, ConfidenceLevel };

export function useConfidenceAnalytics(trades: Trade[]): ConfidenceAnalytics {
  return useMemo(() => calculateConfidenceAnalytics(trades), [trades]);
}
