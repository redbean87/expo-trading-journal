import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { StatRow } from '../../components/stat-row';
import { useAppTheme } from '../../hooks/use-app-theme';
import {
  TradeAgainOption,
  useTradeAgainAnalytics,
} from '../../hooks/use-trade-again-analytics';
import { Trade } from '../../types';

type TradeAgainCardProps = {
  trades: Trade[];
};

type TradeAgainRowProps = {
  label: string;
  count: number;
  winRate: number;
  avgPnl: number;
  profitColor: string;
  lossColor: string;
  styles: ReturnType<typeof createStyles>;
};

const OPTION_LABELS: Record<TradeAgainOption, string> = {
  yes: 'Yes',
  no: 'No',
  withAdjustment: 'With Adjustment',
};

const OPTION_ORDER: TradeAgainOption[] = ['yes', 'withAdjustment', 'no'];

function TradeAgainRow({
  label,
  count,
  winRate,
  avgPnl,
  profitColor,
  lossColor,
  styles,
}: TradeAgainRowProps) {
  const isProfitable = avgPnl >= 0;
  const pnlColor = isProfitable ? profitColor : lossColor;
  const pnlPrefix = isProfitable ? '+' : '';

  return (
    <View style={styles.row}>
      <Text variant="titleSmall" style={styles.optionLabel}>
        {label}
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

export function TradeAgainCard({ trades }: TradeAgainCardProps) {
  const theme = useAppTheme();
  const analytics = useTradeAgainAnalytics(trades);
  const styles = createStyles(theme);

  const hasData = analytics.totalTradesWithResponse > 0;

  return (
    <SectionCard title="Would You Take It Again?">
      {!hasData ? (
        <CardEmptyState
          icon="replay"
          title="No replay decisions yet"
          subtitle="Mark whether you'd take each trade again to see how your post-trade judgment aligns with performance"
        />
      ) : (
        <>
          <View style={styles.summarySection}>
            <StatRow
              label="Trades with Replay Decision:"
              value={`${analytics.totalTradesWithResponse}`}
            />
            {analytics.totalTradesWithoutResponse > 0 && (
              <StatRow
                label="Trades without Decision:"
                value={`${analytics.totalTradesWithoutResponse}`}
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
              Performance by Replay Decision
            </Text>
            <View style={styles.optionsList}>
              {OPTION_ORDER.map((option) => {
                const stats = analytics.byOption[option];
                if (stats.count === 0) return null;
                return (
                  <TradeAgainRow
                    key={option}
                    label={OPTION_LABELS[option]}
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
    optionsList: {
      gap: theme.spacing.md,
    },
    row: {
      paddingVertical: theme.spacing.sm,
    },
    optionLabel: {
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
