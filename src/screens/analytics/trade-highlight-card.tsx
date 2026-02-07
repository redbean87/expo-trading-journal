import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { Trade } from '../../types';

type TradeHighlightCardProps = {
  title: string;
  trade: Trade | null;
  valueColor: string;
  emptyIcon: string;
  emptySubtitle: string;
};

export function TradeHighlightCard({
  title,
  trade,
  valueColor,
  emptyIcon,
  emptySubtitle,
}: TradeHighlightCardProps) {
  return (
    <SectionCard title={title}>
      {!trade ? (
        <CardEmptyState
          icon={emptyIcon}
          title="No trades yet"
          subtitle={emptySubtitle}
        />
      ) : (
        <>
          <Text variant="titleMedium">{trade.symbol}</Text>
          <Text variant="bodyMedium">{trade.side.toUpperCase()}</Text>
          <Text variant="bodyLarge" style={[{ color: valueColor }, styles.pnl]}>
            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)} (
            {trade.pnlPercent.toFixed(2)}%)
          </Text>
        </>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  pnl: {
    marginTop: 8,
  },
});
