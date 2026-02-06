import React from 'react';

import { ChartsSection } from './charts-section';
import { useEquityCurve } from '../../hooks/use-equity-curve';
import { useAnalyticsData, useAnalyticsLayout } from '../analytics-layout';

export default function ChartsRoute() {
  const { trades } = useAnalyticsData();
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
