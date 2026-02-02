import React from 'react';

import { TimingSection } from './timing-section';
import { useTradesInRange } from '../../hooks/use-trades';
import { useAnalyticsStore } from '../../store/analytics-store';
import { getDateRangeStart } from '../../utils/date-range';

export default function TimingRoute() {
  const { selectedRange } = useAnalyticsStore();
  const startTime = getDateRangeStart(selectedRange);
  const { trades } = useTradesInRange(startTime);

  return <TimingSection trades={trades} />;
}
