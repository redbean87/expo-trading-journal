import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CalendarDay } from './calendar-day';
import { useContentWidth } from '../../../hooks/use-content-width';
import { DailyPnl, UseDailyPnlResult } from '../../../hooks/use-daily-pnl';
import { getMonthDays, isSameMonth } from '../../../utils/calendar-helpers';

const COLUMNS = 7;
const HORIZONTAL_PADDING = 64; // content padding (16) + Card.Content padding (16) on each side

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
  const screenWidth = useContentWidth();
  const monthDays = getMonthDays(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth()
  );

  const availableWidth = screenWidth - HORIZONTAL_PADDING;
  const cellSize = Math.floor(availableWidth / COLUMNS);

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
          size={cellSize}
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
