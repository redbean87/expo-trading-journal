import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Chip } from '../../components/chip';
import { PSYCHOLOGY_OPTIONS } from '../../constants/psychology-options';
import { useAppTheme } from '../../hooks/use-app-theme';

type PsychologySelectorProps = {
  value: string | undefined;
  onChange: (value: string) => void;
};

function parseSelected(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function serializeSelected(selected: Set<string>): string {
  return Array.from(selected).join(',');
}

export function PsychologySelector({
  value,
  onChange,
}: PsychologySelectorProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const selected = parseSelected(value);

  const handleToggle = (option: string) => {
    const next = new Set(selected);
    if (next.has(option)) {
      next.delete(option);
    } else {
      next.add(option);
    }
    onChange(serializeSelected(next));
  };

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>
        Psychology (Optional)
      </Text>
      <View style={styles.chipGrid}>
        {PSYCHOLOGY_OPTIONS.map((option) => (
          <Chip
            key={option}
            selected={selected.has(option)}
            onPress={() => handleToggle(option)}
            style={styles.chip}
            compact
          >
            {option}
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
