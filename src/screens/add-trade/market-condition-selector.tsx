import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Chip } from '../../components/chip';
import { MARKET_CONDITIONS } from '../../constants/market-conditions';
import { useAppTheme } from '../../hooks/use-app-theme';

type MarketConditionSelectorProps = {
  value?: string;
  onSelect: (condition: string | undefined) => void;
};

export function MarketConditionSelector({
  value,
  onSelect,
}: MarketConditionSelectorProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>
        Market Condition (Optional)
      </Text>
      <View style={styles.chips}>
        {MARKET_CONDITIONS.map((condition) => (
          <Chip
            key={condition}
            selected={value === condition}
            onPress={() =>
              onSelect(value === condition ? undefined : condition)
            }
            style={styles.chip}
            textStyle={styles.chipText}
            compact
          >
            {condition}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      marginBottom: theme.spacing.sm,
      opacity: 0.7,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    chipText: {
      textAlign: 'center',
    },
  });
