import React from 'react';
import { StyleSheet } from 'react-native';
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

import { CardEmptyState } from '../../components/card-empty-state';
import { ChartContainer } from '../../components/chart-container';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { StrategyMetrics } from '../../hooks/use-strategy-analytics';
import { getChartHeight } from '../../utils/chart-dimensions';

type StrategyPnlBarCardProps = {
  strategies: StrategyMetrics[];
  availableWidth?: number;
};

export default function StrategyPnlBarCard({
  strategies,
}: StrategyPnlBarCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);

  const chartHeight = getChartHeight('bar', breakpoint);

  const hasData =
    strategies.length > 0 && strategies.some((s) => s.tradeCount > 0);

  const chartData = strategies.map((s) => ({
    name: s.name.length > 6 ? s.name.slice(0, 5) + '…' : s.name,
    value: s.totalPnl,
  }));

  return (
    <SectionCard title="P&L by Strategy">
      {!hasData ? (
        <CardEmptyState
          icon="chart-bar"
          title="No strategy P&L data yet"
          subtitle="Tag your trades with a strategy to compare performance"
        />
      ) : (
        <ChartContainer height={chartHeight} style={styles.chartContainer}>
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fill: theme.colors.textSecondary, fontSize: 10 }}
              stroke={theme.colors.border}
            />
            <YAxis
              tick={{ fill: theme.colors.textSecondary, fontSize: 10 }}
              stroke={theme.colors.border}
              tickFormatter={(value: number) => `$${value}`}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.value >= 0 ? theme.colors.profit : theme.colors.loss
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </SectionCard>
  );
}

const createStyles = (_theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    chartContainer: {
      marginLeft: -10,
    },
  });
