import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';

import { LoadingState } from '../components/loading-state';
import { StatRow } from '../components/stat-row';
import { useAppTheme } from '../hooks/use-app-theme';
import { useEquityCurve } from '../hooks/use-equity-curve';
import { useTradeAnalytics } from '../hooks/use-trade-analytics';
import { useTrades } from '../hooks/use-trades';
import { EquityCurveCard } from './analytics/equity-curve-card';
import { TradeHighlightCard } from './analytics/trade-highlight-card';

export default function AnalyticsScreen() {
  const { trades, isLoading } = useTrades();
  const theme = useAppTheme();
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const {
    totalTrades,
    winningTrades,
    losingTrades,
    breakEvenTrades,
    totalPnl,
    avgWin,
    avgLoss,
    winRate,
    profitFactor,
    bestTrade,
    worstTrade,
    longTrades,
    shortTrades,
    longPnl,
    shortPnl,
  } = useTradeAnalytics(trades);
  const equityCurveData = useEquityCurve(trades);

  const styles = createStyles(theme);

  return (
    <LoadingState isLoading={isLoading}>
      <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Title title="Performance Overview" />
            <Card.Content>
              <StatRow label="Total Trades:" value={totalTrades} />
              <StatRow label="Win Rate:" value={`${winRate.toFixed(1)}%`} />
              <StatRow
                label="Total P&L:"
                value={`$${totalPnl.toFixed(2)}`}
                valueColor={
                  totalPnl >= 0 ? theme.colors.profit : theme.colors.loss
                }
              />
              <StatRow
                label="Profit Factor:"
                value={
                  profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)
                }
              />
            </Card.Content>
          </Card>

          {equityCurveData.dataPoints.length > 0 && (
            <EquityCurveCard
              data={equityCurveData}
              onInteractionStart={() => setScrollEnabled(false)}
              onInteractionEnd={() => setScrollEnabled(true)}
            />
          )}

          <Card style={styles.card}>
            <Card.Title title="Trade Statistics" />
            <Card.Content>
              <StatRow
                label="Winning Trades:"
                value={winningTrades.length}
                valueColor={theme.colors.profit}
              />
              <StatRow
                label="Losing Trades:"
                value={losingTrades.length}
                valueColor={theme.colors.loss}
              />
              <StatRow label="Break Even:" value={breakEvenTrades.length} />
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
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Side Analysis" />
            <Card.Content>
              <StatRow
                label="Long Trades:"
                value={`${longTrades.length} (${longPnl >= 0 ? '+' : ''}$${longPnl.toFixed(2)})`}
              />
              <StatRow
                label="Short Trades:"
                value={`${shortTrades.length} (${shortPnl >= 0 ? '+' : ''}$${shortPnl.toFixed(2)})`}
              />
            </Card.Content>
          </Card>

          {bestTrade && (
            <TradeHighlightCard
              title="Best Trade"
              trade={bestTrade}
              valueColor={theme.colors.profit}
            />
          )}

          {worstTrade && (
            <TradeHighlightCard
              title="Worst Trade"
              trade={worstTrade}
              valueColor={theme.colors.loss}
            />
          )}
        </View>
      </ScrollView>
    </LoadingState>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    card: {
      marginBottom: 16,
    },
  });
