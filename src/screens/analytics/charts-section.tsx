import { useRouter } from 'expo-router';
import React from 'react';

import { DayOfWeekCard } from './day-of-week-card';
import EquityCurveCard from './equity-curve-card';
import { PnlCalendarCard } from './pnl-calendar-card';
import { TimeOfDayCard } from './time-of-day-card';
import { DailyPnl } from '../../hooks/use-daily-pnl';
import { EquityCurveData } from '../../hooks/use-equity-curve';
import { Trade } from '../../types';
import { formatDateKey } from '../../utils/calendar-helpers';

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
  const router = useRouter();

  const handleDayPress = (date: Date, dayData: DailyPnl | undefined) => {
    if (dayData && dayData.tradeCount > 0) {
      const dateKey = formatDateKey(date);
      router.push(`/trades?dateFrom=${dateKey}&dateTo=${dateKey}`);
    }
  };

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
      <TimeOfDayCard trades={trades} />
      <PnlCalendarCard trades={trades} onDayPress={handleDayPress} />
    </>
  );
}
