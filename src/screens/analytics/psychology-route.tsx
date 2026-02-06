import React from 'react';

import { PsychologySection } from './psychology-section';
import { useAnalyticsData } from '../analytics-layout';

export default function PsychologyRoute() {
  const { trades } = useAnalyticsData();

  return <PsychologySection trades={trades} />;
}
