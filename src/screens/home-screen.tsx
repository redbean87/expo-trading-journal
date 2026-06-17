import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { DateRangeFilter } from '../components/date-range-filter';
import { LoadingState } from '../components/loading-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { ResponsiveGrid } from '../components/responsive-grid';
import { StatCard } from '../components/stat-card';
import { useAppTheme } from '../hooks/use-app-theme';
import { useHomeSummary } from '../hooks/use-home-summary';
import { useTrades } from '../hooks/use-trades';
import { useTimeFilterStore } from '../store/time-filter-store';
import { HomeEdgeMetrics } from './home/home-edge-metrics';
import { HomeHeader } from './home/home-header';
import { HomeStreakBadge } from './home/home-streak-badge';
import { PositionSizingCalculatorDialog } from './home/position-sizing-calculator-dialog';
import { RecentTradesCard } from './home/recent-trades-card';
import { SymbolSummaryCard } from './home/symbol-summary-card';

export default function HomeScreen() {
  const { trades, isLoading } = useTrades();
  const {
    selectedRange,
    setSelectedRange,
    customRangeStart,
    customRangeEnd,
    setCustomRange,
  } = useTimeFilterStore();
  const [calcVisible, setCalcVisible] = useState(false);
  const theme = useAppTheme();

  const {
    totalTrades,
    totalPnl,
    winRate,
    winningCount,
    losingCount,
    avgWin,
    avgLoss,
    profitFactor,
    recentTrades,
    currentStreak,
    symbolSummary,
  } = useHomeSummary(trades, selectedRange, customRangeStart, customRangeEnd);

  const styles = createStyles(theme);

  return (
    <LoadingState isLoading={isLoading}>
      <ScrollView style={styles.container}>
        <ResponsiveContainer>
          <View style={styles.content}>
            <HomeHeader onCalculatorPress={() => setCalcVisible(true)} />
            <HomeStreakBadge streak={currentStreak} />
            <DateRangeFilter
              selectedRange={selectedRange}
              customRangeStart={customRangeStart}
              customRangeEnd={customRangeEnd}
              onSelectRange={setSelectedRange}
              onSetCustomRange={setCustomRange}
            />

            <View style={styles.statsGrid}>
              <ResponsiveGrid columns={{ mobile: 2, tablet: 2, desktop: 4 }}>
                <StatCard title="Total Trades" value={totalTrades} />
                <StatCard
                  title="Total P&L"
                  value={`$${totalPnl.toFixed(2)}`}
                  valueColor={
                    totalPnl >= 0 ? theme.colors.profit : theme.colors.loss
                  }
                />
                <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} />
                <StatCard
                  title="W/L Ratio"
                  value={`${winningCount}/${losingCount}`}
                />
              </ResponsiveGrid>
            </View>

            <HomeEdgeMetrics
              avgWin={avgWin}
              avgLoss={avgLoss}
              profitFactor={profitFactor}
            />

            <SymbolSummaryCard summary={symbolSummary} />

            <RecentTradesCard trades={recentTrades} />
          </View>
        </ResponsiveContainer>
      </ScrollView>

      <PositionSizingCalculatorDialog
        visible={calcVisible}
        onDismiss={() => setCalcVisible(false)}
      />
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
      padding: theme.spacing.lg,
    },
    statsGrid: {
      marginBottom: theme.spacing.lg,
    },
  });
