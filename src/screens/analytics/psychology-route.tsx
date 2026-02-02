import React from 'react';

import { PsychologySection } from './psychology-section';
import { useTradesInRange } from '../../hooks/use-trades';
import { useAnalyticsStore } from '../../store/analytics-store';
import { getDateRangeStart } from '../../utils/date-range';

export default function PsychologyRoute() {
  const { selectedRange } = useAnalyticsStore();
  const startTime = getDateRangeStart(selectedRange);
  const { trades } = useTradesInRange(startTime);

  return <PsychologySection trades={trades} />;
}
