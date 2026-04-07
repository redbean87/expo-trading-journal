import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, customText } from 'react-native-paper';

const Text = customText<'sectionTitle' | 'statValue'>();

import { useAppTheme } from '../hooks/use-app-theme';

type StatCardProps = {
  title: string;
  value: string | number;
  valueColor?: string;
};

export function StatCard({ title, value, valueColor }: StatCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="sectionTitle" style={{ color: theme.colors.primary }}>
          {title}
        </Text>
        <Text
          variant="statValue"
          style={[styles.value, valueColor && { color: valueColor }]}
        >
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      ...theme.elevation[1],
    },
    value: {
      marginTop: theme.spacing.sm,
    },
  });
