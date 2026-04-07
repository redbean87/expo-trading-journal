import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

type FormLayoutProps = {
  children: React.ReactNode;
  title?: string;
  last?: boolean;
};

export function FormLayout({ children, title, last = false }: FormLayoutProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      {title && (
        <Text variant="labelLarge" style={styles.title}>
          {title}
        </Text>
      )}
      {children}
      {!last && <Divider style={styles.divider} />}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    divider: {
      marginTop: theme.spacing.sm,
    },
  });
