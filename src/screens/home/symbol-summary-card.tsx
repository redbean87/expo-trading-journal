import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { EmptyState } from '../../components/empty-state';
import { SectionCard } from '../../components/section-card';
import { SymbolPerformanceRow } from '../../components/symbol-performance-row';
import { useAppTheme } from '../../hooks/use-app-theme';
import { SymbolSummaryItem } from '../../hooks/use-symbol-performance';

const HOME_WINNER_COUNT = 3;
const HOME_LOSER_COUNT = 3;

type SymbolSummaryCardProps = {
  summary: SymbolSummaryItem[];
};

export function SymbolSummaryCard({ summary }: SymbolSummaryCardProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const winners = summary
    .filter((item) => item.pnl >= 0)
    .slice(0, HOME_WINNER_COUNT);
  const losers = summary
    .filter((item) => item.pnl < 0)
    .sort((a, b) => a.pnl - b.pnl)
    .slice(0, HOME_LOSER_COUNT);

  return (
    <SectionCard
      title="Performance by Symbol"
      right={
        <Button
          mode="text"
          compact
          textColor={theme.colors.primaryContainer}
          onPress={() => router.push('/analytics/symbols')}
        >
          View all
        </Button>
      }
    >
      <EmptyState
        data={summary}
        fallback={
          <CardEmptyState
            icon="format-list-bulleted"
            title="No trades in this period"
            subtitle="Adjust your date range or add a trade to see performance by symbol"
          />
        }
      >
        <View>
          {winners.length > 0 && (
            <View style={styles.section}>
              <Text
                variant="titleSmall"
                style={[styles.sectionTitle, { color: theme.colors.profit }]}
              >
                Top Winners
              </Text>
              {winners.map((item) => (
                <SymbolPerformanceRow key={item.symbol} item={item} />
              ))}
            </View>
          )}

          {losers.length > 0 && (
            <View style={styles.section}>
              <Text
                variant="titleSmall"
                style={[styles.sectionTitle, { color: theme.colors.loss }]}
              >
                Top Losers
              </Text>
              {losers.map((item) => (
                <SymbolPerformanceRow key={item.symbol} item={item} />
              ))}
            </View>
          )}
        </View>
      </EmptyState>
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },
  });
