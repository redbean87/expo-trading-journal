import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { useAppTheme } from '../../../hooks/use-app-theme';
import { useContentWidth } from '../../../hooks/use-content-width';
import { AppTheme } from '../../../theme';
import {
  formatMonthYear,
  getWeekdayLabels,
} from '../../../utils/calendar-helpers';

const COLUMNS = 7;
const HORIZONTAL_PADDING = 64;

type CalendarHeaderProps = {
  selectedMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarHeader({
  selectedMonth,
  onPrevMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  const theme = useAppTheme();
  const screenWidth = useContentWidth();
  const styles = createStyles(theme);
  const weekdays = getWeekdayLabels();

  const availableWidth = screenWidth - HORIZONTAL_PADDING;
  const cellSize = Math.floor(availableWidth / COLUMNS);

  return (
    <View>
      <View style={styles.monthNav}>
        <IconButton icon="chevron-left" onPress={onPrevMonth} size={20} />
        <Text variant="titleMedium" style={styles.monthText}>
          {formatMonthYear(selectedMonth)}
        </Text>
        <IconButton icon="chevron-right" onPress={onNextMonth} size={20} />
      </View>
      <View style={styles.weekdays}>
        {weekdays.map((day) => (
          <View key={day} style={[styles.weekdayCell, { width: cellSize }]}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    monthText: {
      fontWeight: '600',
    },
    weekdays: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    weekdayCell: {
      alignItems: 'center',
    },
    weekdayText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  });
