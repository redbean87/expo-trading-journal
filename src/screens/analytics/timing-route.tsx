import React from 'react';

import { TimingSection } from './timing-section';
import { useAnalyticsData } from '../analytics-layout';

export default function TimingRoute() {
  const { trades } = useAnalyticsData();

  return <TimingSection trades={trades} />;
}
