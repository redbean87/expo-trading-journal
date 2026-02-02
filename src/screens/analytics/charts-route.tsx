import React from 'react';

import { ChartsSection } from './charts-section';
import { useEquityCurve } from '../../hooks/use-equity-curve';
import { useTradesInRange } from '../../hooks/use-trades';
import { useAnalyticsStore } from '../../store/analytics-store';
import { getDateRangeStart } from '../../utils/date-range';
import { useAnalyticsLayout } from '../analytics-layout';

export default function ChartsRoute() {
  const { selectedRange } = useAnalyticsStore();
  const startTime = getDateRangeStart(selectedRange);
  const { trades } = useTradesInRange(startTime);
  const equityCurveData = useEquityCurve(trades);
  const { setScrollEnabled } = useAnalyticsLayout();

  return (
    <ChartsSection
      equityCurveData={equityCurveData}
      trades={trades}
      onInteractionStart={() => setScrollEnabled(false)}
      onInteractionEnd={() => setScrollEnabled(true)}
    />
  );
}
