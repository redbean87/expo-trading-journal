import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CardEmptyState } from '../../components/card-empty-state';
import { EmptyState } from '../../components/empty-state';
import { SectionCard } from '../../components/section-card';
import { SymbolPerformanceRow } from '../../components/symbol-performance-row';
import { useAppTheme } from '../../hooks/use-app-theme';
import { SymbolSummaryItem } from '../../hooks/use-symbol-performance';

type SymbolsSectionProps = {
  symbols: SymbolSummaryItem[];
};

export function SymbolsSection({ symbols }: SymbolsSectionProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <SectionCard title="Performance by Symbol">
      <EmptyState
        data={symbols}
        fallback={
          <CardEmptyState
            icon="format-list-bulleted"
            title="No trades in this period"
            subtitle="Adjust your date range or add a trade to see performance by symbol"
          />
        }
      >
        <View style={styles.list}>
          {symbols.map((item) => (
            <SymbolPerformanceRow key={item.symbol} item={item} />
          ))}
        </View>
      </EmptyState>
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    list: {
      marginTop: theme.spacing.sm,
    },
  });
