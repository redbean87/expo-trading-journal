import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { StatRow } from '../../components/stat-row';
import { useAppTheme } from '../../hooks/use-app-theme';

type RiskRewardCardProps = {
  realizedRR: number;
  expectedValue: number;
  requiredWinRate: number;
  actualWinRate: number;
  longRR: number;
  shortRR: number;
  longWinRate: number;
  shortWinRate: number;
  hasLongTrades: boolean;
  hasShortTrades: boolean;
  totalTrades: number;
};

function formatRR(rr: number): string {
  if (rr === Infinity) return '∞';
  if (rr === 0) return 'N/A';
  return `${rr.toFixed(2)}:1`;
}

export function RiskRewardCard({
  realizedRR,
  expectedValue,
  requiredWinRate,
  actualWinRate,
  longRR,
  shortRR,
  longWinRate,
  shortWinRate,
  hasLongTrades,
  hasShortTrades,
  totalTrades,
}: RiskRewardCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const hasData = totalTrades > 0;

  return (
    <SectionCard title="Risk/Reward Analysis">
      {!hasData ? (
        <CardEmptyState
          icon="scale-balance"
          title="No risk/reward data yet"
          subtitle="Add trades with entry/exit prices to see R:R analysis"
        />
      ) : (
        <>
          {(() => {
            const winRateEdge = actualWinRate - requiredWinRate;
            const hasPositiveEdge = expectedValue > 0;
            const showSideBreakdown = hasLongTrades || hasShortTrades;

            return (
              <>
                <StatRow
                  label="Realized R:R:"
                  value={formatRR(realizedRR)}
                  valueColor={
                    realizedRR >= 1 ? theme.colors.profit : theme.colors.loss
                  }
                />
                <StatRow
                  label="Expected Value:"
                  value={`$${expectedValue.toFixed(2)}/trade`}
                  valueColor={
                    hasPositiveEdge ? theme.colors.profit : theme.colors.loss
                  }
                />
                <StatRow
                  label="Required Win Rate:"
                  value={
                    requiredWinRate > 0
                      ? `${requiredWinRate.toFixed(1)}%`
                      : 'N/A'
                  }
                />
                <StatRow
                  label="Win Rate Edge:"
                  value={
                    requiredWinRate > 0
                      ? `${winRateEdge >= 0 ? '+' : ''}${winRateEdge.toFixed(1)}%`
                      : 'N/A'
                  }
                  valueColor={
                    winRateEdge >= 0 ? theme.colors.profit : theme.colors.loss
                  }
                />

                {showSideBreakdown && (
                  <View style={styles.sideSection}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>
                      By Side
                    </Text>
                    {hasLongTrades && (
                      <StatRow
                        label="Long R:R:"
                        value={`${formatRR(longRR)} (${longWinRate.toFixed(1)}% WR)`}
                      />
                    )}
                    {hasShortTrades && (
                      <StatRow
                        label="Short R:R:"
                        value={`${formatRR(shortRR)} (${shortWinRate.toFixed(1)}% WR)`}
                      />
                    )}
                  </View>
                )}
              </>
            );
          })()}
        </>
      )}
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    sideSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      marginBottom: 8,
      color: theme.colors.textSecondary,
    },
  });
