import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useBreakpoint } from '../hooks/use-breakpoint';

type CardEmptyStateProps = {
  title: string;
  subtitle?: string;
  icon?: string;
};

export function CardEmptyState({ title, subtitle, icon }: CardEmptyStateProps) {
  const theme = useAppTheme();
  const { isDesktop } = useBreakpoint();
  const styles = createStyles(theme, isDesktop);

  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon source={icon} size={24} color={theme.colors.textTertiary} />
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
      paddingVertical: isDesktop ? 32 : 24,
      paddingHorizontal: 16,
    },
    iconContainer: {
      marginBottom: 12,
    },
    title: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
