import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

import { Button } from './button';
import { DatePickerDialog } from './date-picker-dialog';
import { useAppTheme } from '../hooks/use-app-theme';

type DateRangePickerDialogProps = {
  visible: boolean;
  initialStart?: Date;
  initialEnd?: Date;
  onConfirm: (start: Date, end: Date) => void;
  onDismiss: () => void;
};

type ActivePicker = 'start' | 'end' | null;

export function DateRangePickerDialog({
  visible,
  initialStart,
  initialEnd,
  onConfirm,
  onDismiss,
}: DateRangePickerDialogProps) {
  const theme = useAppTheme();
  const [startDate, setStartDate] = useState<Date | undefined>(initialStart);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEnd);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const styles = createStyles(theme);

  const handleConfirm = () => {
    if (startDate && endDate) {
      onConfirm(startDate, endDate);
    }
  };

  const handleStartConfirm = (date: Date) => {
    setStartDate(date);
    if (endDate && date > endDate) setEndDate(undefined);
    setActivePicker(null);
  };

  const handleEndConfirm = (date: Date) => {
    setEndDate(date);
    setActivePicker(null);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isConfirmDisabled = !startDate || !endDate || startDate > endDate;

  if (!visible) return null;

  return (
    <>
      <Portal>
        <Dialog visible={true} onDismiss={onDismiss} style={styles.dialog}>
          <Dialog.Title>Custom Date Range</Dialog.Title>
          <Dialog.Content>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text variant="labelMedium" style={styles.label}>
                  Start Date
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setActivePicker('start')}
                  style={styles.dateButton}
                  contentStyle={styles.dateButtonContent}
                >
                  {formatDate(startDate)}
                </Button>
              </View>
              <View style={styles.field}>
                <Text variant="labelMedium" style={styles.label}>
                  End Date
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setActivePicker('end')}
                  style={styles.dateButton}
                  contentStyle={styles.dateButtonContent}
                >
                  {formatDate(endDate)}
                </Button>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onDismiss}>Cancel</Button>
            <Button onPress={handleConfirm} disabled={isConfirmDisabled}>
              Apply
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <DatePickerDialog
        visible={activePicker === 'start'}
        date={startDate}
        label="Select Start Date"
        onConfirm={handleStartConfirm}
        onDismiss={() => setActivePicker(null)}
      />
      <DatePickerDialog
        visible={activePicker === 'end'}
        date={endDate}
        label="Select End Date"
        onConfirm={handleEndConfirm}
        onDismiss={() => setActivePicker(null)}
      />
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    dialog: {
      maxWidth: 600,
      alignSelf: 'center',
      width: '90%',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    field: {
      flex: 1,
    },
    label: {
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    dateButton: {
      borderRadius: 8,
    },
    dateButtonContent: {
      justifyContent: 'flex-start',
    },
  });
