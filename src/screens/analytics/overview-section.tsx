import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

import { RiskRewardCard } from './risk-reward-card';
import { TradeHighlightCard } from './trade-highlight-card';
import { StatRow } from '../../components/stat-row';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { Trade } from '../../types';
import { formatDuration } from '../../utils/format-duration';

type OverviewSectionProps = {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgTradePnl: number;
  profitFactor: number;
  winningTradesCount: number;
  losingTradesCount: number;
  breakEvenTradesCount: number;
  avgWin: number;
  avgLoss: number;
  avgPerShareWin: number;
  avgPerShareLoss: number;
  largestGain: number;
  largestLoss: number;
  avgHoldTimeMs: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  longTradesCount: number;
  shortTradesCount: number;
  longPnl: number;
  shortPnl: number;
  realizedRR: number;
  expectedValue: number;
  requiredWinRate: number;
  longRR: number;
  shortRR: number;
  longWinRate: number;
  shortWinRate: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
};

export function OverviewSection({
  totalTrades,
  winRate,
  totalPnl,
  avgTradePnl,
  profitFactor,
  winningTradesCount,
  losingTradesCount,
  breakEvenTradesCount,
  avgWin,
  avgLoss,
  avgPerShareWin,
  avgPerShareLoss,
  largestGain,
  largestLoss,
  avgHoldTimeMs,
  maxConsecutiveWins,
  maxConsecutiveLosses,
  longTradesCount,
  shortTradesCount,
  longPnl,
  shortPnl,
  realizedRR,
  expectedValue,
  requiredWinRate,
  longRR,
  shortRR,
  longWinRate,
  shortWinRate,
  bestTrade,
  worstTrade,
}: OverviewSectionProps) {
  const theme = useAppTheme();
  const { isDesktop } = useBreakpoint();
  const styles = createStyles();

  const allCards = [
    <Card key="performance" style={styles.card}>
      <Card.Title title="Performance Overview" />
      <Card.Content>
        <StatRow label="Total Trades:" value={totalTrades} />
        <StatRow label="Win Rate:" value={`${winRate.toFixed(1)}%`} />
        <StatRow
          label="Total P&L:"
          value={`$${totalPnl.toFixed(2)}`}
          valueColor={totalPnl >= 0 ? theme.colors.profit : theme.colors.loss}
        />
        <StatRow
          label="Avg Trade P&L:"
          value={`$${avgTradePnl.toFixed(2)}`}
          valueColor={
            avgTradePnl >= 0 ? theme.colors.profit : theme.colors.loss
          }
        />
        <StatRow
          label="Profit Factor:"
          value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
        />
      </Card.Content>
    </Card>,

    <Card key="statistics" style={styles.card}>
      <Card.Title title="Trade Statistics" />
      <Card.Content>
        <StatRow
          label="Winning Trades:"
          value={winningTradesCount}
          valueColor={theme.colors.profit}
        />
        <StatRow
          label="Losing Trades:"
          value={losingTradesCount}
          valueColor={theme.colors.loss}
        />
        <StatRow label="Break Even:" value={breakEvenTradesCount} />
        <StatRow
          label="Avg Win:"
          value={`$${avgWin.toFixed(2)}`}
          valueColor={theme.colors.profit}
        />
        <StatRow
          label="Avg Loss:"
          value={`$${avgLoss.toFixed(2)}`}
          valueColor={theme.colors.loss}
        />
        <StatRow
          label="Avg Per-Share Win:"
          value={`$${avgPerShareWin.toFixed(4)}`}
          valueColor={theme.colors.profit}
        />
        <StatRow
          label="Avg Per-Share Loss:"
          value={`$${avgPerShareLoss.toFixed(4)}`}
          valueColor={theme.colors.loss}
        />
        <StatRow
          label="Largest Gain:"
          value={`$${largestGain.toFixed(2)}`}
          valueColor={theme.colors.profit}
        />
        <StatRow
          label="Largest Loss:"
          value={`$${largestLoss.toFixed(2)}`}
          valueColor={theme.colors.loss}
        />
        <StatRow label="Avg Hold Time:" value={formatDuration(avgHoldTimeMs)} />
      </Card.Content>
    </Card>,

    totalTrades > 0 ? (
      <RiskRewardCard
        key="risk-reward"
        realizedRR={realizedRR}
        expectedValue={expectedValue}
        requiredWinRate={requiredWinRate}
        actualWinRate={winRate}
        longRR={longRR}
        shortRR={shortRR}
        longWinRate={longWinRate}
        shortWinRate={shortWinRate}
        hasLongTrades={longTradesCount > 0}
        hasShortTrades={shortTradesCount > 0}
      />
    ) : null,

    <Card key="streak" style={styles.card}>
      <Card.Title title="Streak Analysis" />
      <Card.Content>
        <StatRow
          label="Max Consecutive Wins:"
          value={maxConsecutiveWins}
          valueColor={theme.colors.profit}
        />
        <StatRow
          label="Max Consecutive Losses:"
          value={maxConsecutiveLosses}
          valueColor={theme.colors.loss}
        />
      </Card.Content>
    </Card>,

    <Card key="side" style={styles.card}>
      <Card.Title title="Side Analysis" />
      <Card.Content>
        <StatRow
          label="Long Trades:"
          value={`${longTradesCount} (${longPnl >= 0 ? '+' : ''}$${longPnl.toFixed(2)})`}
        />
        <StatRow
          label="Short Trades:"
          value={`${shortTradesCount} (${shortPnl >= 0 ? '+' : ''}$${shortPnl.toFixed(2)})`}
        />
      </Card.Content>
    </Card>,

    bestTrade ? (
      <TradeHighlightCard
        key="best"
        title="Best Trade"
        trade={bestTrade}
        valueColor={theme.colors.profit}
      />
    ) : null,

    worstTrade ? (
      <TradeHighlightCard
        key="worst"
        title="Worst Trade"
        trade={worstTrade}
        valueColor={theme.colors.loss}
      />
    ) : null,
  ].filter((card): card is React.ReactElement => card !== null);

  if (!isDesktop) {
    return <>{allCards}</>;
  }

  const leftCards = allCards.filter((_, i) => i % 2 === 0);
  const rightCards = allCards.filter((_, i) => i % 2 === 1);

  return (
    <View style={styles.masonry}>
      <View style={styles.column}>{leftCards}</View>
      <View style={styles.column}>{rightCards}</View>
    </View>
  );
}

const COLUMN_GAP = 16;
const HALF_GAP = COLUMN_GAP / 2;

const createStyles = () =>
  StyleSheet.create({
    card: {
      marginBottom: 16,
    },
    masonry: {
      flexDirection: 'row',
      marginHorizontal: -HALF_GAP,
    },
    column: {
      flex: 1,
      paddingHorizontal: HALF_GAP,
    },
  });
