import React from 'react';

import { DayOfWeekCard } from './day-of-week-card';
import { EquityCurveCard } from './equity-curve-card';
import { PnlCalendarCard } from './pnl-calendar-card';
import { EquityCurveData } from '../../hooks/use-equity-curve';
import { Trade } from '../../types';

type ChartsSectionProps = {
  equityCurveData: EquityCurveData;
  trades: Trade[];
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
};

export function ChartsSection({
  equityCurveData,
  trades,
  onInteractionStart,
  onInteractionEnd,
}: ChartsSectionProps) {
  if (equityCurveData.dataPoints.length === 0) {
    return null;
  }

  return (
    <>
      <EquityCurveCard
        data={equityCurveData}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />
      <DayOfWeekCard trades={trades} />
      <PnlCalendarCard trades={trades} />
    </>
  );
}
