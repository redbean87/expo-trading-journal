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
      marginBottom: 16,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      marginBottom: 8,
      color: theme.colors.primary,
    },
    titleInRow: {
      color: theme.colors.primary,
    },
  });
