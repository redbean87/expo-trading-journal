import React from 'react';

import { PatternsSection } from './patterns-section';
import { useAnalyticsData } from '../analytics-layout';

export default function PatternsRoute() {
  const { trades } = useAnalyticsData();

  return <PatternsSection trades={trades} />;
}
