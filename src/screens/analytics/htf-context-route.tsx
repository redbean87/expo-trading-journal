import React from 'react';

import { useAnalyticsData } from '../analytics-layout';
import { HtfContextSection } from './htf-context-section';

export default function HtfContextRoute() {
  const { trades } = useAnalyticsData();
  return <HtfContextSection trades={trades} />;
}
