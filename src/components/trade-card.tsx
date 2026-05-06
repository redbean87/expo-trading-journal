import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  PressableStateCallbackType,
  Animated,
} from 'react-native';
import { Text, Card } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { Trade } from '../types';
import { formatDate } from '../utils/date-format';

type PressableState = PressableStateCallbackType & { hovered?: boolean };

type TradeCardProps = {
  trade: Trade;
  disableNavigation?: boolean;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

export function TradeCard({
  trade,
  disableNavigation,
  onSelect,
  isSelected,
}: TradeCardProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (onSelect) {
      onSelect(trade.id);
    } else if (!disableNavigation) {
      router.push(`/trades/${trade.id}`);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const isProfit = trade.pnl >= 0;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {({ hovered }: PressableState) => (
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Card
            style={[
              styles.card,
              hovered && styles.cardHovered,
              isSelected && styles.cardSelected,
            ]}
          >
            <Card.Content>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text variant="titleLarge" style={styles.symbol}>
                    {trade.symbol}
                  </Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {trade.side.toUpperCase()} • {trade.quantity} shares
                  </Text>
                </View>
                <View style={styles.headerRight}>
                  <Text
                    variant="headlineSmall"
                    style={[
                      styles.pnl,
                      {
                        color: isProfit
                          ? theme.colors.profit
                          : theme.colors.loss,
                      },
                    ]}
                  >
                    {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {trade.pnlPercent >= 0 ? '+' : ''}
                    {trade.pnlPercent.toFixed(2)}%
                  </Text>
                </View>
              </View>

              {trade.strategy && (
                <View style={styles.strategyRow}>
                  <Text variant="bodySmall" style={styles.strategyLabel}>
                    Strategy: {trade.strategy}
                  </Text>
                </View>
              )}

              <Text variant="bodySmall" style={styles.date}>
                {formatDate(trade.entryTime)}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
    </Pressable>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      ...theme.elevation[2],
    },
    cardHovered: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    cardSelected: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primaryContainer,
      ...theme.elevation[3],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    symbol: {
      fontWeight: 'bold',
    },
    meta: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    pnl: {
      fontWeight: 'bold',
    },
    pnlPercent: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    strategyRow: {
      marginTop: theme.spacing.sm,
    },
    strategyLabel: {
      color: theme.colors.textSecondary,
    },
    date: {
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
  });
