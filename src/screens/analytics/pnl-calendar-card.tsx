import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';
import { DailyPnl, useDailyPnl } from '../../hooks/use-daily-pnl';
import { AppTheme } from '../../theme';
import { Trade } from '../../types';
import { CalendarGrid } from './pnl-calendar/calendar-grid';
import { CalendarHeader } from './pnl-calendar/calendar-header';
import { addMonths } from '../../utils/calendar-helpers';

type PnlCalendarCardProps = {
  trades: Trade[];
  onDayPress?: (date: Date, dayData: DailyPnl | undefined) => void;
};

export function PnlCalendarCard({ trades, onDayPress }: PnlCalendarCardProps) {
  const theme = useAppTheme();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const dailyPnlData = useDailyPnl(trades);
  const styles = createStyles(theme);

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="P&L Calendar" />
      <Card.Content>
        <CalendarHeader
          selectedMonth={selectedMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarGrid
          selectedMonth={selectedMonth}
          dailyPnlData={dailyPnlData}
          onDayPress={onDayPress}
        />
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
  });
