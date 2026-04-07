import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';
import { CurrentStreak } from '../../hooks/use-trade-analytics';

type HomeStreakBadgeProps = {
  streak: CurrentStreak;
};

export function HomeStreakBadge({ streak }: HomeStreakBadgeProps) {
  const theme = useAppTheme();

  if (streak.count === 0 || streak.type === 'none') return null;

  const color = streak.type === 'win' ? theme.colors.profit : theme.colors.loss;
  const label =
    streak.type === 'win'
      ? `${streak.count} Win Streak`
      : `${streak.count} Loss Streak`;
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <Text variant="bodyMedium" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      borderLeftWidth: 3,
      paddingLeft: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
  });
