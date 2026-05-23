import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { Trade } from '../types';
import { formatDateTime } from '../utils/date-format';

type DuplicateTradeCardProps = {
  trade: Trade;
  label: string;
  highlightFields?: string[];
};

export function DuplicateTradeCard({
  trade,
  label,
  highlightFields = [],
}: DuplicateTradeCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const isProfit = trade.pnl >= 0;
  const pnlColor = isProfit ? theme.colors.profit : theme.colors.loss;

  const formatField = (label: string, value: string | number | undefined) => {
    const isHighlighted = highlightFields.includes(label);
    return (
      <View style={styles.fieldRow} key={label}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text
          style={[styles.fieldValue, isHighlighted && styles.highlightedValue]}
        >
          {value ?? '-'}
        </Text>
      </View>
    );
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.symbol}>{trade.symbol}</Text>
        <Text style={styles.meta}>LONG • {trade.quantity} shares</Text>
        <Text style={[styles.pnl, { color: pnlColor }]}>
          {isProfit ? '+' : ''}
          {trade.pnl.toFixed(2)} ({trade.pnlPercent.toFixed(2)}%)
        </Text>

        <View style={styles.fieldsContainer}>
          {formatField('Entry Time', formatDateTime(trade.entryTime))}
          {formatField('Exit Time', formatDateTime(trade.exitTime))}
          {formatField('Entry Price', trade.entryPrice.toFixed(4))}
          {formatField('Exit Price', trade.exitPrice.toFixed(4))}
          {formatField('Fees', trade.fees?.toFixed(2) ?? '0.00')}
          {formatField('Commissions', trade.commissions?.toFixed(2) ?? '0.00')}
          {formatField('Order Type', trade.orderType ?? '-')}
          {formatField('Source', trade.importedFrom ?? 'manual')}
          {trade.importId && formatField('Import ID', trade.importId)}
        </View>
      </Card.Content>
    </Card>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    card: {
      flex: 1,
      margin: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    cardLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    symbol: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    meta: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    pnl: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    fieldsContainer: {
      marginTop: theme.spacing.sm,
    },
    fieldRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    fieldLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    fieldValue: {
      fontSize: 13,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    highlightedValue: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
  });
}
