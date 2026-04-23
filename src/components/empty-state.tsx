import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { Button } from './button';
import { useAppTheme } from '../hooks/use-app-theme';
import { useBreakpoint } from '../hooks/use-breakpoint';

type EmptyStateAction = {
  label: string;
  onPress: () => void;
  icon?: string;
};

type EmptyStateProps = {
  data: unknown[];
  title?: string;
  subtitle?: string;
  icon?: string;
  fallback?: ReactNode;
  action?: EmptyStateAction;
  children: ReactNode;
};

export function EmptyState({
  data,
  title,
  subtitle,
  icon,
  fallback,
  action,
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

  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon
            source={icon}
            size={theme.iconSizes.lg}
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
      {action && (
        <Button
          mode="contained"
          onPress={action.onPress}
          icon={action.icon}
          style={styles.actionButton}
        >
          {action.label}
        </Button>
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
      padding: isDesktop ? theme.spacing.xxl : theme.spacing.xl,
    },
    iconContainer: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    actionButton: {
      marginTop: theme.spacing.sm,
    },
  });
