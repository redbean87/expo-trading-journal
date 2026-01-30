import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useBreakpoint } from '../hooks/use-breakpoint';

type EmptyStateProps = {
  data: unknown[];
  title?: string;
  subtitle?: string;
  icon?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export function EmptyState({
  data,
  title,
  subtitle,
  icon,
  fallback,
  children,
}: EmptyStateProps) {
  const theme = useAppTheme();
  const { isDesktop } = useBreakpoint();
  const styles = createStyles(theme, isDesktop);

  if (data.length > 0) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const iconSize = isDesktop ? 64 : 48;

  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon
            source={icon}
            size={iconSize}
            color={theme.colors.textTertiary}
          />
        </View>
      )}
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
    },
    iconContainer: {
      marginBottom: 16,
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
