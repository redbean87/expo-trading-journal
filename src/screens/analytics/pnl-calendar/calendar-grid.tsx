import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CalendarDay } from './calendar-day';
import { DailyPnl, UseDailyPnlResult } from '../../../hooks/use-daily-pnl';
import { getMonthDays, isSameMonth } from '../../../utils/calendar-helpers';

type CalendarGridProps = {
  selectedMonth: Date;
  dailyPnlData: UseDailyPnlResult;
  onDayPress?: (date: Date, dayData: DailyPnl | undefined) => void;
};

export function CalendarGrid({
  selectedMonth,
  dailyPnlData,
  onDayPress,
}: CalendarGridProps) {
  const monthDays = getMonthDays(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth()
  );

  return (
    <View style={styles.grid}>
      {monthDays.map((date, index) => (
        <CalendarDay
          key={index}
          date={date}
          isCurrentMonth={isSameMonth(date, selectedMonth)}
          dayData={dailyPnlData.getDayData(date)}
          maxProfit={dailyPnlData.maxProfit}
          maxLoss={dailyPnlData.maxLoss}
          onPress={() => onDayPress?.(date, dailyPnlData.getDayData(date))}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
