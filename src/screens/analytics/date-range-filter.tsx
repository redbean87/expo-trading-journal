import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';
import { DateRangePreset, dateRangeOptions } from '../../utils/date-range';

type DateRangeFilterProps = {
  selectedRange: DateRangePreset;
  onSelectRange: (range: DateRangePreset) => void;
};

export function DateRangeFilter({
  selectedRange,
  onSelectRange,
}: DateRangeFilterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

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
            onPress={() => onSelectRange(option.value)}
            style={styles.chip}
          >
            {option.label}
          </Chip>
        ))}
      </View>
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
  });
