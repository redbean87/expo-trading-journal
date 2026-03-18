import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Chip } from '../../components/chip';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useTrades } from '../../hooks/use-trades';

type StrategySelectorProps = {
  value: string | undefined;
  onSelect: (value: string) => void;
};

export function StrategySelector({ value, onSelect }: StrategySelectorProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const { trades } = useTrades();
  const strategies = Array.from(
    new Set(trades.map((t) => t.strategy).filter(Boolean))
  ).sort() as string[];

  if (strategies.length === 0) return null;

  const handleSelect = (strategy: string) => {
    onSelect(value === strategy ? '' : strategy);
  };

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>
        Recent Strategies
      </Text>
      <View style={styles.chipGrid}>
        {strategies.map((strategy) => (
          <Chip
            key={strategy}
            selected={value === strategy}
            onPress={() => handleSelect(strategy)}
            style={styles.chip}
            compact
          >
            {strategy}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: 8,
    },
    label: {
      marginBottom: 8,
      color: theme.colors.textSecondary,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      marginBottom: 4,
    },
  });
