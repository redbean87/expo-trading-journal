import { useMemo } from 'react';

import { Trade } from '../types';
import {
  PeriodType,
  PeriodSummary,
  groupTradesByPeriod,
} from '../utils/period-grouping';

export type { PeriodType, PeriodSummary };

export function usePeriodBreakdown(
  trades: Trade[],
  periodType: PeriodType
): PeriodSummary[] {
  return useMemo(
    () => groupTradesByPeriod(trades, periodType),
    [trades, periodType]
  );
}
