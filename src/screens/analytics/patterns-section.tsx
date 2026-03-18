import React from 'react';

import DayOfWeekCard from './day-of-week-card';
import HoldTimeHistogramCard from './hold-time-histogram-card';
import { PeriodBreakdownCard } from './period-breakdown-card';
import TimeOfDayCard from './time-of-day-card';
import { Trade } from '../../types';

type PatternsSectionProps = {
  trades: Trade[];
};

export function PatternsSection({ trades }: PatternsSectionProps) {
  return (
    <>
      <HoldTimeHistogramCard trades={trades} />
      <DayOfWeekCard trades={trades} />
      <TimeOfDayCard trades={trades} />
      <PeriodBreakdownCard trades={trades} />
    </>
  );
}
