import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { LoadingState } from '../components/loading-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { ResponsiveGrid } from '../components/responsive-grid';
import { StatCard } from '../components/stat-card';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTrades } from '../hooks/use-trades';
import { useTradesSummary } from '../hooks/use-trades-summary';
import { HomeHeader } from './home/home-header';
import { RecentTradesCard } from './home/recent-trades-card';

export default function HomeScreen() {
  const { trades, isLoading } = useTrades();
  const theme = useAppTheme();

  const {
    totalTrades,
    winningTrades,
    losingTrades,
    totalPnl,
    winRate,
    recentTrades,
  } = useTradesSummary(trades);

  const styles = createStyles(theme);

  return (
    <LoadingState isLoading={isLoading}>
      <ScrollView style={styles.container}>
        <ResponsiveContainer>
          <View style={styles.content}>
            <HomeHeader />

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
                  value={`${winningTrades}/${losingTrades}`}
                />
              </ResponsiveGrid>
            </View>

            <RecentTradesCard trades={recentTrades} />
          </View>
        </ResponsiveContainer>
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
    statsGrid: {
      marginBottom: 16,
    },
  });
