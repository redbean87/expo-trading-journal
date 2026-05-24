import React, { useMemo } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Line, Rect } from 'react-native-svg';
// @ts-expect-error - react-native-svg-charts doesn't have TypeScript definitions
import { BarChart, XAxis } from 'react-native-svg-charts';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useContentWidth } from '../../hooks/use-content-width';
import { useDailyPnl } from '../../hooks/use-daily-pnl';
import { Trade } from '../../types';
import {
  getBarXAxisInset,
  getChartHeight,
  getChartWidth,
  Y_AXIS_LABEL_WIDTH,
} from '../../utils/chart-dimensions';

type DailyPnlBarCardProps = {
  trades: Trade[];
};

type CustomBarsProps = {
  x: (index: number) => number;
  y: (value: number) => number;
  bandwidth: number;
  data: number[];
};

type ZeroLineProps = {
  y: (value: number) => number;
};

export default function DailyPnlBarCard({ trades }: DailyPnlBarCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles(theme);
  const { dailyPnlMap } = useDailyPnl(trades);

  const chartWidth = getChartWidth(contentWidth);
  const chartHeight = getChartHeight('bar', breakpoint);

  const sortedDays = useMemo(
    () =>
      Array.from(dailyPnlMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      ),
    [dailyPnlMap]
  );

  const data = useMemo(
    () => sortedDays.map((day) => day.totalPnl),
    [sortedDays]
  );
  const xAxisInset = getBarXAxisInset(chartWidth, data.length);

  const labels = useMemo(
    () =>
      sortedDays.map((day) => {
        const month = day.date.getMonth() + 1;
        const dayNum = day.date.getDate();
        return `${month}/${dayNum}`;
      }),
    [sortedDays]
  );

  const yAxisMax = useMemo(
    () => (data.length > 0 ? Math.max(...data).toFixed(0) : '0'),
    [data]
  );
  const yAxisMin = useMemo(
    () => (data.length > 0 ? Math.min(...data).toFixed(0) : '0'),
    [data]
  );

  // Show every Nth label to avoid crowding on the x-axis
  const labelStep = data.length > 20 ? 5 : data.length > 10 ? 3 : 1;

  const contentInset = { top: 30, bottom: 10, left: 8, right: 8 };

  // Decorator functions for react-native-svg-charts
  /* eslint-disable react-hooks/static-components */
  const CustomBars = useMemo(
    () =>
      ({ x, y, bandwidth, data: chartData }: CustomBarsProps) =>
        chartData.map((value: number, index: number) => {
          const barColor = value >= 0 ? theme.colors.profit : theme.colors.loss;
          const barHeight = Math.abs(y(value) - y(0));
          const barY = value >= 0 ? y(value) : y(0);

          return (
            <Rect
              key={`bar-${index}`}
              x={x(index)}
              y={barY}
              width={bandwidth}
              height={barHeight}
              fill={barColor}
              rx={4}
            />
          );
        }),
    [theme.colors.profit, theme.colors.loss]
  );

  const ZeroLine = useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      ({ y }: ZeroLineProps) => (
        <Line
          x1="0%"
          x2="100%"
          y1={y(0)}
          y2={y(0)}
          stroke={theme.colors.border}
          strokeWidth={1}
        />
      ),
    [theme.colors.border]
  );
  /* eslint-enable react-hooks/static-components */

  return (
    <SectionCard title="Daily P&L">
      {data.length === 0 ? (
        <CardEmptyState
          icon="chart-bar"
          title="No daily P&L data yet"
          subtitle="Add trades to see your day-by-day performance"
        />
      ) : (
        <View style={styles.container}>
          {/* Y-axis labels */}
          <View style={styles.yAxisContainer}>
            <RNText style={styles.yAxisLabel}>{yAxisMax}</RNText>
            <RNText style={styles.yAxisLabel}>0</RNText>
            <RNText style={styles.yAxisLabel}>{yAxisMin}</RNText>
          </View>

          {/* Chart */}
          <View style={styles.chartWrapper}>
            {/*
              Note: Decorator components for react-native-svg-charts are created during render by design.
              The library calls these functions with specific props. This is the intended pattern.
            */}
            {/* eslint-disable react-hooks/static-components */}
            <BarChart
              style={[styles.chart, { height: chartHeight, width: chartWidth }]}
              data={data}
              contentInset={contentInset}
              spacingInner={0.3}
              spacingOuter={0.2}
            >
              {/* @ts-expect-error - react-native-svg-charts passes props to decorators internally */}
              <ZeroLine />
              {/* @ts-expect-error - react-native-svg-charts passes props to decorators internally */}
              <CustomBars />
            </BarChart>
            {/* eslint-enable react-hooks/static-components */}

            {/* X-axis */}
            <XAxis
              style={styles.xAxis}
              data={data}
              formatLabel={(_: unknown, index: number) =>
                index % labelStep === 0 ? labels[index] : ''
              }
              contentInset={xAxisInset}
              svg={{
                fontSize: 10,
                fill: theme.colors.textSecondary,
              }}
            />
          </View>
        </View>
      )}
    </SectionCard>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginLeft: -10,
    },
    yAxisContainer: {
      width: Y_AXIS_LABEL_WIDTH,
      justifyContent: 'space-between',
      paddingVertical: 30,
    },
    yAxisLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      paddingRight: 8,
    },
    chartWrapper: {
      flex: 1,
    },
    chart: {
      width: '100%',
    },
    xAxis: {
      marginTop: 4,
      height: 20,
    },
  });
