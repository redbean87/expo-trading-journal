import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { SegmentedButtons } from '../../components/segmented-buttons';
import { StatRow } from '../../components/stat-row';
import { useAppTheme } from '../../hooks/use-app-theme';
import {
  useMistakeAnalytics,
  MistakeSummary,
} from '../../hooks/use-mistake-analytics';
import { spacing } from '../../theme';
import { Trade } from '../../types';

type MistakesCardProps = {
  trades: Trade[];
};

type ViewMode = 'frequency' | 'impact';

function MistakeRow({
  mistake,
  viewMode,
  profitColor,
  lossColor,
}: {
  mistake: MistakeSummary;
  viewMode: ViewMode;
  profitColor: string;
  lossColor: string;
}) {
  const isProfitable = mistake.totalPnl >= 0;
  const pnlColor = isProfitable ? profitColor : lossColor;
  const pnlPrefix = isProfitable ? '+' : '';

  return (
    <View style={styles.mistakeRow}>
      <Text variant="titleSmall" style={styles.mistakeLabel}>
        {mistake.label}
      </Text>
      <View style={styles.metricsRow}>
        {viewMode === 'frequency' ? (
          <>
            <Text variant="bodyMedium" style={styles.metric}>
              {mistake.count} trades
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.metric, { color: pnlColor }]}
            >
              {pnlPrefix}${mistake.avgPnl.toFixed(2)} avg
            </Text>
          </>
        ) : (
          <>
            <Text
              variant="bodyMedium"
              style={[styles.metric, { color: pnlColor }]}
            >
              {pnlPrefix}${mistake.totalPnl.toFixed(2)}
            </Text>
            <Text variant="bodyMedium" style={styles.metric}>
              {mistake.count} trades
            </Text>
          </>
        )}
        <Text variant="bodyMedium" style={styles.metric}>
          {mistake.winRate.toFixed(0)}% WR
        </Text>
      </View>
    </View>
  );
}

export function MistakesCard({ trades }: MistakesCardProps) {
  const theme = useAppTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('frequency');
  const analytics = useMistakeAnalytics(trades);

  const themedStyles = createThemedStyles(theme);

  const hasData = analytics.totalTradesWithMistakes > 0;

  return (
    <SectionCard title="Mistakes Analysis">
      {!hasData ? (
        <CardEmptyState
          icon="check-circle-outline"
          title="No mistakes recorded yet"
          subtitle="Great trading! Or start tracking mistakes to improve"
        />
      ) : (
        <>
          {(() => {
            const totalTrades =
              analytics.totalTradesWithMistakes +
              analytics.totalTradesWithoutMistakes;
            const mistakePercentage =
              (analytics.totalTradesWithMistakes / totalTrades) * 100;

            const sortedMistakes =
              viewMode === 'frequency'
                ? [...analytics.mistakesByCategory].sort(
                    (a, b) => b.count - a.count
                  )
                : [...analytics.mistakesByCategory].sort(
                    (a, b) => a.totalPnl - b.totalPnl
                  );

            return (
              <>
                <View style={themedStyles.summarySection}>
                  <StatRow
                    label="Trades with Mistakes:"
                    value={`${analytics.totalTradesWithMistakes} (${mistakePercentage.toFixed(0)}%)`}
                  />
                  <StatRow
                    label="P&L with Mistakes:"
                    value={`$${analytics.pnlWithMistakes.toFixed(2)}`}
                    valueColor={
                      analytics.pnlWithMistakes >= 0
                        ? theme.colors.profit
                        : theme.colors.loss
                    }
                  />
                  <StatRow
                    label="P&L without Mistakes:"
                    value={`$${analytics.pnlWithoutMistakes.toFixed(2)}`}
                    valueColor={
                      analytics.pnlWithoutMistakes >= 0
                        ? theme.colors.profit
                        : theme.colors.loss
                    }
                  />
                  <StatRow
                    label="Avg P&L Difference:"
                    value={`$${(analytics.avgPnlWithoutMistakes - analytics.avgPnlWithMistakes).toFixed(2)}`}
                    valueColor={theme.colors.textSecondary}
                  />
                </View>

                <View style={themedStyles.breakdownSection}>
                  <Text variant="titleSmall" style={themedStyles.sectionTitle}>
                    Breakdown
                  </Text>
                  <SegmentedButtons
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as ViewMode)}
                    buttons={[
                      { value: 'frequency', label: 'By Frequency' },
                      { value: 'impact', label: 'By Impact' },
                    ]}
                    style={styles.toggle}
                  />
                  {sortedMistakes.length === 0 ? (
                    <Text style={themedStyles.emptyText}>
                      No categorized mistakes
                    </Text>
                  ) : (
                    <View style={styles.mistakesList}>
                      {sortedMistakes.map((mistake) => (
                        <MistakeRow
                          key={mistake.categoryId}
                          mistake={mistake}
                          viewMode={viewMode}
                          profitColor={theme.colors.profit}
                          lossColor={theme.colors.loss}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </>
            );
          })()}
        </>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginBottom: spacing.lg,
  },
  mistakesList: {
    gap: spacing.md,
  },
  mistakeRow: {
    paddingVertical: spacing.sm,
  },
  mistakeLabel: {
    marginBottom: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    minWidth: 70,
  },
});

const createThemedStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    summarySection: {
      marginBottom: spacing.lg,
    },
    breakdownSection: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      marginBottom: spacing.sm,
      color: theme.colors.textSecondary,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
