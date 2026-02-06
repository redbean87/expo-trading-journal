import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/use-app-theme';

type DataPointTooltipProps = {
  label: string;
  value: string;
  valueColor: string;
};

export function DataPointTooltip({
  label,
  value,
  valueColor,
}: DataPointTooltipProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    label: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    value: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
