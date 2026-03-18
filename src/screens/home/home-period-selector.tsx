import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Chip } from '../../components/chip';
import { spacing } from '../../theme';
import { HomePeriod } from '../../types';

type HomePeriodSelectorProps = {
  period: HomePeriod;
  onChangePeriod: (period: HomePeriod) => void;
};

const PERIOD_OPTIONS: { label: string; value: HomePeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

export function HomePeriodSelector({
  period,
  onChangePeriod,
}: HomePeriodSelectorProps) {
  return (
    <View style={styles.chipRow}>
      {PERIOD_OPTIONS.map((option) => (
        <Chip
          key={option.value}
          selected={period === option.value}
          onPress={() => onChangePeriod(option.value)}
          style={styles.chip}
        >
          {option.label}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    marginBottom: 4,
  },
});
