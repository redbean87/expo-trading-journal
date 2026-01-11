import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

type EmptyStateProps = {
  data: unknown[];
  title?: string;
  subtitle?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export function EmptyState({
  data,
  title,
  subtitle,
  fallback,
  children,
}: EmptyStateProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  if (data.length > 0) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    title: {
      marginBottom: 8,
      color: theme.colors.textSecondary,
    },
    subtitle: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
  });
