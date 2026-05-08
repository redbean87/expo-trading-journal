import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { StatRow } from '../../components/stat-row';
import { useAppTheme } from '../../hooks/use-app-theme';
import {
  ConfidenceLevel,
  useConfidenceAnalytics,
} from '../../hooks/use-confidence-analytics';
import { Trade } from '../../types';

type ConfidenceCardProps = {
  trades: Trade[];
};

type ConfidenceRowProps = {
  level: ConfidenceLevel;
  count: number;
  winRate: number;
  avgPnl: number;
  profitColor: string;
  lossColor: string;
  styles: ReturnType<typeof createStyles>;
};

function ConfidenceRow({
  level,
  count,
  winRate,
  avgPnl,
  profitColor,
  lossColor,
  styles,
}: ConfidenceRowProps) {
  const isProfitable = avgPnl >= 0;
  const pnlColor = isProfitable ? profitColor : lossColor;
  const pnlPrefix = isProfitable ? '+' : '';

  return (
    <View style={styles.row}>
      <Text variant="titleSmall" style={styles.levelLabel}>
        Level {level}
      </Text>
      <View style={styles.metricsRow}>
        <Text variant="bodyMedium" style={styles.metric}>
          {count} trades
        </Text>
        <Text variant="bodyMedium" style={styles.metric}>
          {winRate.toFixed(0)}% WR
        </Text>
        <Text variant="bodyMedium" style={[styles.metric, { color: pnlColor }]}>
          {pnlPrefix}${avgPnl.toFixed(2)} avg
        </Text>
      </View>
    </View>
  );
}

export function ConfidenceCard({ trades }: ConfidenceCardProps) {
  const theme = useAppTheme();
  const analytics = useConfidenceAnalytics(trades);
  const styles = createStyles(theme);

  const hasData = analytics.totalTradesWithConfidence > 0;

  return (
    <SectionCard title="Setup Quality Analysis">
      {!hasData ? (
        <CardEmptyState
          icon="chart-line"
          title="No setup quality data yet"
          subtitle="Start rating your setup quality (1-5) on trades to analyze how pre-trade assessment correlates with performance"
        />
      ) : (
        <>
          <View style={styles.summarySection}>
            <StatRow
              label="Trades with Setup Quality Rating:"
              value={`${analytics.totalTradesWithConfidence}`}
            />
            {analytics.totalTradesWithoutConfidence > 0 && (
              <StatRow
                label="Trades without Rating:"
                value={`${analytics.totalTradesWithoutConfidence}`}
              />
            )}
          </View>

          {analytics.insight && (
            <View style={styles.insightSection}>
              <Text variant="bodyMedium" style={styles.insightText}>
                {analytics.insight}
              </Text>
            </View>
          )}

          <View style={styles.breakdownSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Performance by Setup Quality Level
            </Text>
            <View style={styles.levelsList}>
              {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((level) => {
                const stats = analytics.byLevel[level];
                if (stats.count === 0) return null;
                return (
                  <ConfidenceRow
                    key={level}
                    level={level}
                    count={stats.count}
                    winRate={stats.winRate}
                    avgPnl={stats.avgPnl}
                    profitColor={theme.colors.profit}
                    lossColor={theme.colors.loss}
                    styles={styles}
                  />
                );
              })}
            </View>
          </View>
        </>
      )}
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    summarySection: {
      marginBottom: theme.spacing.lg,
    },
    insightSection: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    insightText: {
      fontStyle: 'italic',
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    breakdownSection: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    levelsList: {
      gap: theme.spacing.md,
    },
    row: {
      paddingVertical: theme.spacing.sm,
    },
    levelLabel: {
      marginBottom: theme.spacing.xs,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
    metric: {
      minWidth: 80,
    },
  });
