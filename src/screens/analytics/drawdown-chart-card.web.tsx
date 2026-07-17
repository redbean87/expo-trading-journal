import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

import { CardEmptyState } from '../../components/card-empty-state';
import { ChartContainer } from '../../components/chart-container';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { EquityCurveData } from '../../hooks/use-equity-curve';
import { getChartHeight } from '../../utils/chart-dimensions';

type DrawdownChartCardProps = {
  data: EquityCurveData;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

type RechartsDataItem = {
  index: number;
  date: string;
  drawdown: number;
  fullDate: string;
};

export default function DrawdownChartCard({
  data,
  onInteractionStart,
  onInteractionEnd,
}: DrawdownChartCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);

  const chartHeight = getChartHeight('line', breakpoint);

  const chartData: RechartsDataItem[] = data.dataPoints.map((point, index) => ({
    index,
    date: `${point.date.getMonth() + 1}/${point.date.getDate()}`,
    drawdown: -point.drawdown,
    fullDate: point.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

  const hasData = chartData.length > 0;

  return (
    <SectionCard title="Drawdown">
      {!hasData ? (
        <CardEmptyState
          icon="chart-line-variant"
          title="No drawdown data yet"
          subtitle="Start trading to track your drawdown progression"
        />
      ) : (
        <>
          <ChartContainer
            height={chartHeight}
            style={styles.chartContainer}
            onTouchStart={onInteractionStart}
            onTouchEnd={onInteractionEnd}
            onTouchCancel={onInteractionEnd}
          >
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={theme.colors.loss}
                    stopOpacity={0.05}
                  />
                  <stop
                    offset="100%"
                    stopColor={theme.colors.loss}
                    stopOpacity={0.3}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: theme.colors.textSecondary, fontSize: 10 }}
                axisLine={{ stroke: theme.colors.border }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.colors.textSecondary, fontSize: 10 }}
                axisLine={{ stroke: theme.colors.border }}
                tickLine={false}
                tickFormatter={(v: number) => `$${Math.abs(v).toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 8,
                }}
                labelStyle={{
                  color: theme.colors.textSecondary,
                  fontSize: 11,
                }}
                formatter={(value: number | undefined) => [
                  `-$${value !== undefined ? Math.abs(value).toFixed(2) : '0.00'}`,
                  'Drawdown',
                ]}
                labelFormatter={(
                  label: React.ReactNode,
                  payload: readonly unknown[]
                ) => {
                  const item = payload?.[0] as
                    | { payload?: RechartsDataItem }
                    | undefined;
                  return typeof label === 'string'
                    ? (item?.payload?.fullDate ?? label)
                    : label;
                }}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke={theme.colors.loss}
                strokeWidth={2}
                fill="url(#drawdownFill)"
              />
            </AreaChart>
          </ChartContainer>
          {data.dataPoints.length > 0 && (
            <View style={styles.stats}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Max:{' '}
                <Text style={styles.drawdownValue}>
                  -${data.maxDrawdown.toFixed(0)}
                </Text>
                {' | Longest Recovery: '}
                {data.longestRecovery} days | Avg: {data.avgRecovery.toFixed(1)}{' '}
                days | Total Days: {data.totalDaysInDrawdown}
              </Text>
            </View>
          )}
        </>
      )}
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    chartContainer: {
      width: '100%',
    },
    stats: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    statLabel: {
      color: theme.colors.textSecondary,
    },
    drawdownValue: {
      color: theme.colors.loss,
    },
  });
