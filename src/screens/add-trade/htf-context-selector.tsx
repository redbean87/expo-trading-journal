import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Chip } from '../../components/chip';
import { HTF_CONTEXTS } from '../../constants/htf-contexts';
import { useAppTheme } from '../../hooks/use-app-theme';

type HtfContextSelectorProps = {
  value?: string;
  onSelect: (context: string | undefined) => void;
};

export function HtfContextSelector({
  value,
  onSelect,
}: HtfContextSelectorProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>
        HTF Context (Optional)
      </Text>
      <View style={styles.chips}>
        {HTF_CONTEXTS.map((context) => (
          <Chip
            key={context}
            selected={value === context}
            onPress={() => onSelect(value === context ? undefined : context)}
            style={styles.chip}
            textStyle={styles.chipText}
            compact
          >
            {context}
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
