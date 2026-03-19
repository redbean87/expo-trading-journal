import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Chip } from '../../components/chip';
import { useAppTheme } from '../../hooks/use-app-theme';

type StrategyFilterProps = {
  strategies: string[];
  selectedStrategy: string | null;
  onSelectStrategy: (strategy: string | null) => void;
};

export function StrategyFilter({
  strategies,
  selectedStrategy,
  onSelectStrategy,
}: StrategyFilterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handlePress = (strategy: string) => {
    onSelectStrategy(selectedStrategy === strategy ? null : strategy);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        Strategy
      </Text>
      <View style={styles.chipRow}>
        <Chip
          selected={selectedStrategy === null}
          onPress={() => onSelectStrategy(null)}
          style={styles.chip}
        >
          All
        </Chip>
        {strategies.map((strategy) => (
          <Chip
            key={strategy}
            selected={selectedStrategy === strategy}
            onPress={() => handlePress(strategy)}
            style={styles.chip}
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
