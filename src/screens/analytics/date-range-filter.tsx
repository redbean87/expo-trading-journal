import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { DateRangePickerDialog } from './date-range-picker-dialog';
import { Chip } from '../../components/chip';
import { useAppTheme } from '../../hooks/use-app-theme';
import { DateRangePreset, dateRangeOptions } from '../../utils/date-range';

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

  const customRangeLabel =
    selectedRange === 'custom' ? formatCustomRange() : null;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        Time Period
      </Text>
      <View style={styles.chipRow}>
        {dateRangeOptions.map((option) => (
          <Chip
            key={option.value}
            selected={selectedRange === option.value}
            onPress={() => handleChipPress(option.value)}
            style={styles.chip}
          >
            {option.label}
          </Chip>
        ))}
      </View>
      {customRangeLabel ? (
        <Text variant="bodySmall" style={styles.customRangeText}>
          {customRangeLabel}
        </Text>
      ) : null}

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
      marginBottom: 16,
    },
    label: {
      marginBottom: 12,
      color: theme.colors.textSecondary,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      marginBottom: 4,
    },
    customRangeText: {
      marginTop: 8,
      color: theme.colors.textSecondary,
    },
  });
