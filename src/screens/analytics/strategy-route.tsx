import React from 'react';

import { useAnalyticsData } from '../analytics-layout';
import { StrategySection } from './strategy-section';

export default function StrategyRoute() {
  const { trades } = useAnalyticsData();
  return <StrategySection trades={trades} />;
}
