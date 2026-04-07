import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useBreakpoint } from '../hooks/use-breakpoint';

type CardEmptyStateAction = {
  label: string;
  onPress: () => void;
  icon?: string;
};

type CardEmptyStateProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: CardEmptyStateAction;
};

export function CardEmptyState({
  title,
  subtitle,
  icon,
  action,
}: CardEmptyStateProps) {
  const theme = useAppTheme();
  const { isDesktop } = useBreakpoint();
  const styles = createStyles(theme, isDesktop);

  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon
            source={icon}
            size={theme.iconSizes.sm}
            color={theme.colors.textTertiary}
          />
        </View>
      )}
      <Text variant="bodyLarge" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {action && (
        <Button
          mode="outlined"
          onPress={action.onPress}
          icon={action.icon}
          style={styles.actionButton}
          compact
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
      minHeight: 120,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: isDesktop ? theme.spacing.xl : theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    iconContainer: {
      marginBottom: theme.spacing.md,
    },
    title: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    actionButton: {
      marginTop: theme.spacing.xs,
    },
  });
