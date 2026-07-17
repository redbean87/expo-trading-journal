import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

import { CardEmptyState } from '../../components/card-empty-state';
import { ChartContainer } from '../../components/chart-container';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useDailyPnl } from '../../hooks/use-daily-pnl';
import { Trade } from '../../types';
import { getChartHeight } from '../../utils/chart-dimensions';

type DailyPnlBarCardProps = {
  trades: Trade[];
};

export default function DailyPnlBarCard({ trades }: DailyPnlBarCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);
  const { dailyPnlMap } = useDailyPnl(trades);

  const chartHeight = getChartHeight('bar', breakpoint);

  const sortedDays = useMemo(
    () =>
      Array.from(dailyPnlMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      ),
    [dailyPnlMap]
  );

  const hasData = sortedDays.length > 0;

  const chartData = sortedDays.map((day) => ({
    name: `${day.date.getMonth() + 1}/${day.date.getDate()}`,
    value: day.totalPnl,
  }));

  return (
    <SectionCard title="Daily P&L">
      {!hasData ? (
        <CardEmptyState
          icon="chart-bar"
          title="No daily P&L data yet"
          subtitle="Add trades to see your day-by-day performance"
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
