import { useRouter } from 'expo-router';
import React from 'react';

import DailyPnlBarCard from './daily-pnl-bar-card';
import DrawdownChartCard from './drawdown-chart-card';
import EquityCurveCard from './equity-curve-card';
import { PnlCalendarCard } from './pnl-calendar-card';
import PnlDistributionCard from './pnl-distribution-card';
import RMultipleDistributionCard from './r-multiple-distribution-card';
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

  return (
    <>
      <EquityCurveCard
        data={equityCurveData}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />
      <DrawdownChartCard
        data={equityCurveData}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />
      <DailyPnlBarCard trades={trades} />
      <PnlCalendarCard trades={trades} onDayPress={handleDayPress} />
      <PnlDistributionCard trades={trades} />
      <RMultipleDistributionCard trades={trades} />
    </>
  );
}
