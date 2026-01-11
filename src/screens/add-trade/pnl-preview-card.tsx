import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';

type PnlPreviewCardProps = {
  pnl: number;
  pnlPercent: number;
};

export function PnlPreviewCard({ pnl, pnlPercent }: PnlPreviewCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Projected P&L</Text>
        <Text
          variant="headlineMedium"
          style={[
            styles.pnlText,
            { color: pnl >= 0 ? theme.colors.profit : theme.colors.loss },
          ]}
        >
          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            color: pnl >= 0 ? theme.colors.profit : theme.colors.loss,
          }}
        >
          {pnlPercent >= 0 ? '+' : ''}
          {pnlPercent.toFixed(2)}%
        </Text>
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    pnlText: {
      marginTop: 8,
      fontWeight: 'bold',
    },
  });
