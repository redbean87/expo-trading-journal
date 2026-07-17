import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList } from 'recharts';

import { CardEmptyState } from '../../components/card-empty-state';
import { ChartContainer } from '../../components/chart-container';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useTimeOfDayBreakdown } from '../../hooks/use-time-of-day-breakdown';
import { Trade } from '../../types';
import { getChartHeight } from '../../utils/chart-dimensions';

type TimeOfDayCardProps = {
  trades: Trade[];
};

export default function TimeOfDayCard({ trades }: TimeOfDayCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);
  const breakdown = useTimeOfDayBreakdown(trades);

  const chartHeight = getChartHeight('bar', breakpoint);

  const hasData = breakdown.some((hour) => hour.tradeCount > 0);

  // Transform data for recharts
  const chartData = breakdown.map((hour) => ({
    name: hour.hourLabel,
    value: hour.totalPnl,
    winRate: hour.winRate,
    hasData: hour.tradeCount > 0,
  }));

  // Custom label formatter for win rate
  const renderWinRateLabel = (props: {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    index?: number;
  }) => {
    const x = Number(props.x) || 0;
    const y = Number(props.y) || 0;
    const width = Number(props.width) || 0;
    const index = props.index ?? 0;
    const hour = chartData[index];

    if (!hour.hasData) return null;

    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill={theme.colors.textSecondary}
        textAnchor="middle"
        fontSize={9}
      >
        {hour.winRate.toFixed(0)}%
      </text>
    );
  };

  return (
    <SectionCard title="P&L by Hour">
      {!hasData ? (
        <CardEmptyState
          icon="clock-outline"
          title="No trading data by hour yet"
          subtitle="Add trades to see your best trading hours"
        />
      ) : (
        <>
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
                <LabelList content={renderWinRateLabel} />
              </Bar>
            </BarChart>
          </ChartContainer>
          <View style={styles.legend}>
            <Text variant="bodySmall" style={styles.legendText}>
              Win rate shown above each bar
            </Text>
          </View>
        </>
      )}
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    chartContainer: {
      marginLeft: -10,
    },
    legend: {
      marginTop: 8,
      alignItems: 'center',
    },
    legendText: {
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
  });
