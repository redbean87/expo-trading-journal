import { useMemo } from 'react';

import { Trade } from '../types';
import {
  MistakeAnalytics,
  MistakeSummary,
  calculateMistakeAnalytics,
} from '../utils/mistake-categorization';

export type { MistakeAnalytics, MistakeSummary };

export function useMistakeAnalytics(trades: Trade[]): MistakeAnalytics {
  return useMemo(() => calculateMistakeAnalytics(trades), [trades]);
}
