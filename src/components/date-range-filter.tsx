import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { Chip } from './chip';
import { DateRangePickerDialog } from './date-range-picker-dialog';
import { useAppTheme } from '../hooks/use-app-theme';
import { DateRangePreset, dateRangeOptions } from '../utils/date-range';

type DateRangeFilterProps = {
  selectedRange: DateRangePreset;
  customRangeStart: number | null;
  customRangeEnd: number | null;
  onSelectRange: (range: DateRangePreset) => void;
  onSetCustomRange: (start: number, end: number) => void;
};

export function DateRangeFilter({
  selectedRange,
  customRangeStart,
  customRangeEnd,
  onSelectRange,
  onSetCustomRange,
}: DateRangeFilterProps) {
  const theme = useAppTheme();
  const [pickerVisible, setPickerVisible] = useState(false);
  const styles = createStyles(theme);

  const handleChipPress = (value: DateRangePreset) => {
    onSelectRange(value);
    if (value === 'custom') {
      setPickerVisible(true);
    }
  };

  const handleCustomConfirm = (start: Date, end: Date) => {
    onSetCustomRange(start.getTime(), end.getTime());
    setPickerVisible(false);
  };

  const formatCustomRange = () => {
    if (!customRangeStart || !customRangeEnd) return null;
    const fmt = (ts: number) =>
      new Date(ts).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    return `${fmt(customRangeStart)} – ${fmt(customRangeEnd)}`;
  };

  const customLabel = formatCustomRange();

  return (
    <View style={styles.container}>
      <View style={styles.chipRow}>
        {dateRangeOptions.map((option) => (
          <Chip
            key={option.value}
            selected={selectedRange === option.value}
            onPress={() => handleChipPress(option.value)}
            style={styles.chip}
          >
            {option.value === 'custom' &&
            selectedRange === 'custom' &&
            customLabel
              ? customLabel
              : option.label}
          </Chip>
        ))}
      </View>

      <DateRangePickerDialog
        visible={pickerVisible}
        initialStart={customRangeStart ? new Date(customRangeStart) : undefined}
        initialEnd={customRangeEnd ? new Date(customRangeEnd) : undefined}
        onConfirm={handleCustomConfirm}
        onDismiss={() => setPickerVisible(false)}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.md,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      marginBottom: 4,
    },
  });
