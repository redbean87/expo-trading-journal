import React from 'react';

import { useSymbolPerformance } from '../../hooks/use-symbol-performance';
import { useAnalyticsData } from '../analytics-layout';
import { SymbolsSection } from './symbols-section';

export default function SymbolsRoute() {
  const { trades } = useAnalyticsData();
  const symbols = useSymbolPerformance(trades);

  return <SymbolsSection symbols={symbols} />;
}
