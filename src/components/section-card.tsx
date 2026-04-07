import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

type SectionCardProps = {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionCard({
  title,
  right,
  children,
  style,
}: SectionCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        {title &&
          (right ? (
            <View style={styles.titleRow}>
              <Text variant="titleMedium" style={styles.titleInRow}>
                {title}
              </Text>
              {right}
            </View>
          ) : (
            <Text variant="titleMedium" style={styles.title}>
              {title}
            </Text>
          ))}
        {children}
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      ...theme.elevation[2],
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.primary,
    },
    titleInRow: {
      color: theme.colors.primary,
    },
  });
