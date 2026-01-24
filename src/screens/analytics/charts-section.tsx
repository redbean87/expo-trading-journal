import React from 'react';

import { EquityCurveCard } from './equity-curve-card';
import { EquityCurveData } from '../../hooks/use-equity-curve';

type ChartsSectionProps = {
  equityCurveData: EquityCurveData;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
};

export function ChartsSection({
  equityCurveData,
  onInteractionStart,
  onInteractionEnd,
}: ChartsSectionProps) {
  if (equityCurveData.dataPoints.length === 0) {
    return null;
  }

  return (
    <EquityCurveCard
      data={equityCurveData}
      onInteractionStart={onInteractionStart}
      onInteractionEnd={onInteractionEnd}
    />
  );
}
