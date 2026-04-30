import React from 'react';

import { useAnalyticsData } from '../analytics-layout';
import { MarketConditionSection } from './market-condition-section';

export default function MarketConditionRoute() {
  const { trades } = useAnalyticsData();
  return <MarketConditionSection trades={trades} />;
}
