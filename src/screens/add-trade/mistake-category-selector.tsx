import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

import { Chip } from '../../components/chip';
import { MISTAKE_CATEGORIES } from '../../constants/mistake-categories';
import { useAppTheme } from '../../hooks/use-app-theme';

type MistakeCategorySelectorProps = {
  value: string | undefined;
  onSelect: (value: string) => void;
};

const QUICK_SELECT_CATEGORIES = MISTAKE_CATEGORIES.filter(
  (c) => c.id !== 'other'
).slice(0, 8);

export function MistakeCategorySelector({
  value,
  onSelect,
}: MistakeCategorySelectorProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handleSelect = (label: string) => {
    if (value === label) {
      onSelect('');
    } else {
      onSelect(label);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>
        Quick Select (or type below)
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {QUICK_SELECT_CATEGORIES.map((category) => (
          <Chip
            key={category.id}
            selected={value === category.label}
            onPress={() => handleSelect(category.label)}
            style={styles.chip}
            compact
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
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
    chipRow: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 16,
    },
    chip: {
      marginBottom: 4,
    },
  });
