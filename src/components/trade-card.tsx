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

import { Chip } from './chip';
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
                  <Text
                    variant="bodyMedium"
                    style={[styles.meta, isSelected && styles.metaSelected]}
                  >
                    {trade.side.toUpperCase()} • {trade.quantity} shares
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text
                    variant="headlineSmall"
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
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.pnlPercent,
                      isSelected && styles.pnlPercentSelected,
                    ]}
                  >
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
                <View style={styles.chipRow}>
                  {trade.strategy && (
                    <Chip
                      compact
                      style={[
                        styles.strategyChip,
                        isSelected && styles.strategyChipSelected,
                      ]}
                      textStyle={
                        isSelected ? styles.strategyChipTextSelected : undefined
                      }
                    >
                      {trade.strategy}
                    </Chip>
                  )}
                  {trade.marketCondition && (
                    <Chip
                      compact
                      style={[
                        styles.marketConditionChip,
                        isSelected && styles.marketConditionChipSelected,
                      ]}
                      textStyle={
                        isSelected
                          ? styles.marketConditionChipTextSelected
                          : undefined
                      }
                    >
                      {trade.marketCondition}
                    </Chip>
                  )}
                </View>
              </View>
            </Card.Content>
            {(onDelete || onEdit) && (
              <View style={styles.actions}>
                {onEdit && (
                  <IconButton
                    icon="pencil"
                    iconColor={theme.colors.primary}
                    onPress={() => onEdit(trade.id)}
                    containerColor={theme.colors.surfaceVariant}
                  />
                )}
                {onDelete && (
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.loss}
                    onPress={() => onDelete(trade.id)}
                    containerColor={theme.colors.surfaceVariant}
                  />
                )}
              </View>
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
    metaSelected: {
      color: theme.colors.onPrimaryContainer,
      opacity: 0.7,
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
    pnlPercentSelected: {
      color: theme.colors.onPrimaryContainer,
      opacity: 0.7,
    },
    details: {
      marginTop: theme.spacing.sm,
    },
    date: {
      marginTop: theme.spacing.xs,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    strategyChip: {
      alignSelf: 'flex-start',
    },
    strategyChipSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    strategyChipTextSelected: {
      color: theme.colors.onPrimaryContainer,
    },
    marketConditionChip: {
      alignSelf: 'flex-start',
    },
    marketConditionChipSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    marketConditionChipTextSelected: {
      color: theme.colors.onPrimaryContainer,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 8,
    },
  });
