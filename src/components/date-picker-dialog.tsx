import React, { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dialog, IconButton, Portal, Text } from 'react-native-paper';

import { Button } from './button';
import { useAppTheme, type AppTheme } from '../hooks/use-app-theme';
import {
  addMonths,
  formatMonthYear,
  getMonthDays,
  getWeekdayLabels,
  isSameDay,
  isSameMonth,
  isToday,
} from '../utils/calendar-helpers';

type DatePickerDialogProps = {
  visible: boolean;
  date?: Date;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
  label?: string;
};

type DatePickerDialogContentProps = Omit<DatePickerDialogProps, 'visible'>;

function DatePickerDialogContent({
  date,
  onConfirm,
  onDismiss,
  label = 'Select date',
}: DatePickerDialogContentProps) {
  const theme = useAppTheme();

  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const ref = date || new Date();
    return new Date(ref.getFullYear(), ref.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [calendarWidth, setCalendarWidth] = useState(0);

  const cellSize = calendarWidth > 0 ? Math.floor(calendarWidth / 7) : 40;
  const styles = createStyles(theme, cellSize);

  const weekdays = getWeekdayLabels();
  const monthDays = getMonthDays(
    displayMonth.getFullYear(),
    displayMonth.getMonth()
  );

  const handlePrevMonth = useCallback(() => {
    setDisplayMonth((prev) => addMonths(prev, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setDisplayMonth((prev) => addMonths(prev, 1));
  }, []);

  const handleDayPress = useCallback(
    (day: Date) => {
      setSelectedDate(day);
      if (!isSameMonth(day, displayMonth)) {
        setDisplayMonth(new Date(day.getFullYear(), day.getMonth(), 1));
      }
    },
    [displayMonth]
  );

  const handleConfirm = useCallback(() => {
    if (selectedDate) onConfirm(selectedDate);
  }, [selectedDate, onConfirm]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setCalendarWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <Portal>
      <Dialog visible={true} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{label}</Dialog.Title>
        <Dialog.Content style={styles.dialogContent}>
          <View style={styles.monthNav}>
            <IconButton
              icon="chevron-left"
              onPress={handlePrevMonth}
              size={20}
            />
            <Text variant="titleMedium" style={styles.monthText}>
              {formatMonthYear(displayMonth)}
            </Text>
            <IconButton
              icon="chevron-right"
              onPress={handleNextMonth}
              size={20}
            />
          </View>

          <View onLayout={handleLayout}>
            <View style={styles.weekdaysRow}>
              {weekdays.map((day) => (
                <View
                  key={day}
                  style={[styles.weekdayCell, { width: cellSize }]}
                >
                  <Text style={styles.weekdayText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {monthDays.map((day, index) => {
                const isSelected = selectedDate
                  ? isSameDay(day, selectedDate)
                  : false;
                const isTodayDate = isToday(day);
                const isCurrentMonth = isSameMonth(day, displayMonth);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      { width: cellSize, height: cellSize },
                      isSelected && styles.selectedDay,
                      !isSelected &&
                        isTodayDate &&
                        isCurrentMonth &&
                        styles.todayDay,
                    ]}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        !isSelected &&
                          isTodayDate &&
                          isCurrentMonth &&
                          styles.todayDayText,
                        !isCurrentMonth && styles.outsideMonthText,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleConfirm} disabled={!selectedDate}>
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export function DatePickerDialog({ visible, ...props }: DatePickerDialogProps) {
  if (!visible) return null;
  return <DatePickerDialogContent {...props} />;
}

const createStyles = (theme: AppTheme, cellSize: number) =>
  StyleSheet.create({
    dialog: {
      maxWidth: 600,
      alignSelf: 'center',
    },
    dialogContent: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    monthText: {
      fontWeight: '600',
    },
    weekdaysRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    weekdayCell: {
      alignItems: 'center',
    },
    weekdayText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: cellSize / 2,
    },
    dayText: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    selectedDay: {
      backgroundColor: theme.colors.primaryContainer,
    },
    selectedDayText: {
      color: theme.colors.onPrimaryContainer,
      fontWeight: '600',
    },
    todayDay: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    todayDayText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    outsideMonthText: {
      opacity: 0.3,
    },
  });
