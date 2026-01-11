import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { Trade } from '../../types';

type TradeHighlightCardProps = {
  title: string;
  trade: Trade;
  valueColor: string;
};

export function TradeHighlightCard({
  title,
  trade,
  valueColor,
}: TradeHighlightCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Title title={title} />
      <Card.Content>
        <Text variant="titleMedium">{trade.symbol}</Text>
        <Text variant="bodyMedium">{trade.side.toUpperCase()}</Text>
        <Text variant="bodyLarge" style={[{ color: valueColor }, styles.pnl]}>
          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)} (
          {trade.pnlPercent.toFixed(2)}%)
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  pnl: {
    marginTop: 8,
  },
});
