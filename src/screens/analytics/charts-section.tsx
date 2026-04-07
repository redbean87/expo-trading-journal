import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import DailyPnlBarCard from './daily-pnl-bar-card';
import EquityCurveCard from './equity-curve-card';
import { PnlCalendarCard } from './pnl-calendar-card';
import { useBreakpoint } from '../../hooks/use-breakpoint';
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
  const { isTablet, isDesktop } = useBreakpoint();

  const handleDayPress = (date: Date, dayData: DailyPnl | undefined) => {
    if (dayData && dayData.tradeCount > 0) {
      const dateKey = formatDateKey(date);
      router.push(`/trades?dateFrom=${dateKey}&dateTo=${dateKey}`);
    }
  };

  const twoColumn = isTablet || isDesktop;

  return (
    <>
      <EquityCurveCard
        data={equityCurveData}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />
      {twoColumn ? (
        <View style={styles.row}>
          <View style={styles.half}>
            <DailyPnlBarCard trades={trades} />
          </View>
          <View style={styles.half}>
            <PnlCalendarCard trades={trades} onDayPress={handleDayPress} />
          </View>
        </View>
      ) : (
        <>
          <DailyPnlBarCard trades={trades} />
          <PnlCalendarCard trades={trades} onDayPress={handleDayPress} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
});
