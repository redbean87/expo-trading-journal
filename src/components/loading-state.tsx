import React, { ReactNode } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useBreakpoint } from '../hooks/use-breakpoint';

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
  const { isDesktop } = useBreakpoint();
  const styles = createStyles(theme, isDesktop);

  if (!isLoading) {
    return <>{children}</>;
  }

  const spinnerSize = isDesktop ? 48 : 36;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={spinnerSize} color={theme.colors.primary} />
      <Text
        variant={isDesktop ? 'bodyLarge' : 'bodyMedium'}
        style={styles.message}
      >
        {message}
      </Text>
    </View>
  );
}

const createStyles = (
  theme: ReturnType<typeof useAppTheme>,
  isDesktop: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: isDesktop ? 48 : 32,
      backgroundColor: theme.colors.background,
    },
    message: {
      marginTop: 16,
      color: theme.colors.textSecondary,
    },
  });
