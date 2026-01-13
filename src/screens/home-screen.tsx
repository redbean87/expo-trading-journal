import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { StatCard } from '../components/stat-card';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTrades } from '../hooks/use-trades';
import { useTradesSummary } from '../hooks/use-trades-summary';
import { useThemeStore } from '../store/theme-store';
import { HomeHeader } from './home/home-header';
import { RecentTradesCard } from './home/recent-trades-card';

export default function HomeScreen() {
  const { trades } = useTrades();
  const { themeMode, toggleTheme } = useThemeStore();
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <HomeHeader themeMode={themeMode} onToggleTheme={toggleTheme} />

        <View style={styles.statsContainer}>
          <StatCard title="Total Trades" value={totalTrades} />
          <StatCard
            title="Total P&L"
            value={`$${totalPnl.toFixed(2)}`}
            valueColor={totalPnl >= 0 ? theme.colors.profit : theme.colors.loss}
          />
          <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} />
          <StatCard
            title="W/L Ratio"
            value={`${winningTrades}/${losingTrades}`}
          />
        </View>

        <RecentTradesCard trades={recentTrades} />
      </View>
    </ScrollView>
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
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
  });
