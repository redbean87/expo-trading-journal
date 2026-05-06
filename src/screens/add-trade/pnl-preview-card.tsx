import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';

type PnlPreviewCardProps = {
  pnl: number;
  pnlPercent: number;
};

export function PnlPreviewCard({ pnl, pnlPercent }: PnlPreviewCardProps) {
  const theme = useAppTheme();
  return (
    <SectionCard title="Projected P&L">
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
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  pnlText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
});
