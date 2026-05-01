import React, { useState } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { Card, customText } from 'react-native-paper';

const Text = customText<'sectionTitle' | 'statValue'>();

import { useAppTheme } from '../hooks/use-app-theme';

type StatCardProps = {
  title: string;
  value: string | number;
  valueColor?: string;
  onPress?: () => void;
};

export function StatCard({ title, value, valueColor, onPress }: StatCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="sectionTitle"
              style={{ color: theme.colors.onSurface }}
            >
              {title}
            </Text>
            <Text
              variant="statValue"
              style={[styles.value, valueColor && { color: valueColor }]}
            >
              {value}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
    </Pressable>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      ...theme.elevation[1],
    },
    value: {
      marginTop: theme.spacing.sm,
    },
  });
