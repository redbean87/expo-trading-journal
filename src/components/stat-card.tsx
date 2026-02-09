import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { borderRadius, elevation, spacing } from '../theme';

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
        <Text variant="titleLarge">{title}</Text>
        <Text
          variant="headlineMedium"
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
      borderRadius: borderRadius.md,
      ...elevation[1],
    },
    value: {
      marginTop: spacing.sm,
      fontWeight: 'bold',
    },
  });
