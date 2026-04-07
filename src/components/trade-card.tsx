import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  PressableStateCallbackType,
  Animated,
} from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { Trade } from '../types';
import { formatDate } from '../utils/date-format';

type PressableState = PressableStateCallbackType & { hovered?: boolean };

type TradeCardProps = {
  trade: Trade;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  disableNavigation?: boolean;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

export function TradeCard({
  trade,
  onDelete,
  onEdit,
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
      router.push(`/trade/${trade.id}`);
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
                <View>
                  <Text variant="titleLarge">{trade.symbol}</Text>
                  <Text variant="bodyMedium" style={styles.meta}>
                    {trade.side.toUpperCase()} • {trade.quantity} shares
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text
                    variant="titleLarge"
                    style={[
                      styles.pnl,
                      {
                        color:
                          trade.pnl >= 0
                            ? theme.colors.profit
                            : theme.colors.loss,
                      },
                    ]}
                  >
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={styles.pnlPercent}>
                    {trade.pnlPercent >= 0 ? '+' : ''}
                    {trade.pnlPercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
              <View style={styles.details}>
                <Text variant="bodySmall">
                  Entry: ${trade.entryPrice.toFixed(2)} • Exit: $
                  {trade.exitPrice.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={styles.date}>
                  {formatDate(trade.entryTime)} - {formatDate(trade.exitTime)}
                </Text>
                {trade.strategy && (
                  <Text variant="bodySmall" style={styles.strategy}>
                    Strategy: {trade.strategy}
                  </Text>
                )}
              </View>
            </Card.Content>
            {(onDelete || onEdit) && (
              <Card.Actions>
                {onEdit && (
                  <IconButton
                    icon="pencil"
                    iconColor={theme.colors.primary}
                    onPress={() => onEdit(trade.id)}
                  />
                )}
                {onDelete && (
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.loss}
                    onPress={() => onDelete(trade.id)}
                  />
                )}
              </Card.Actions>
            )}
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
      backgroundColor: theme.colors.primaryContainer,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      ...theme.elevation[3],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    meta: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    right: {
      alignItems: 'flex-end',
    },
    pnl: {
      fontWeight: 'bold',
    },
    pnlPercent: {
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    details: {
      marginTop: theme.spacing.sm,
    },
    date: {
      marginTop: theme.spacing.xs,
    },
    strategy: {
      marginTop: theme.spacing.xs,
      fontStyle: 'italic',
    },
  });
