import React, { ReactNode } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

type LoadingStateProps = {
  isLoading: boolean;
  message?: string;
  children: ReactNode;
};

export function LoadingState({
  isLoading,
  message = 'Loading...',
  children,
}: LoadingStateProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
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
      backgroundColor: theme.colors.background,
    },
    message: {
      marginTop: 16,
      color: theme.colors.textSecondary,
    },
  });
