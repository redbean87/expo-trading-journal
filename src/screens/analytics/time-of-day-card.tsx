import React, { useMemo } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text } from 'react-native-paper';
import { Line, Text as SVGText, Rect } from 'react-native-svg';
// @ts-expect-error - react-native-svg-charts doesn't have TypeScript definitions
import { BarChart, XAxis } from 'react-native-svg-charts';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useContentWidth } from '../../hooks/use-content-width';
import { useTimeOfDayBreakdown } from '../../hooks/use-time-of-day-breakdown';
import { Trade } from '../../types';
import {
  getChartHeight,
  getChartWidth,
  Y_AXIS_LABEL_WIDTH,
} from '../../utils/chart-dimensions';

type TimeOfDayCardProps = {
  trades: Trade[];
};

type CustomBarsProps = {
  x: (index: number) => number;
  y: (value: number) => number;
  bandwidth: number;
  data: number[];
};

type WinRateLabelsProps = {
  x: (index: number) => number;
  y: (value: number) => number;
  bandwidth: number;
};

type ZeroLineProps = {
  y: (value: number) => number;
};

type HourBreakdown = {
  hourLabel: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
};

export default function TimeOfDayCard({ trades }: TimeOfDayCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles(theme);
  const breakdown = useTimeOfDayBreakdown(trades);

  const chartWidth = getChartWidth(contentWidth);
  const chartHeight = getChartHeight('bar', breakpoint);

  const data = useMemo(
    () => breakdown.map((hour) => hour.totalPnl),
    [breakdown]
  );
  const labels = useMemo(
    () => breakdown.map((hour) => hour.hourLabel),
    [breakdown]
  );
  const yAxisMax = useMemo(() => Math.max(...data).toFixed(0), [data]);
  const yAxisMin = useMemo(() => Math.min(...data).toFixed(0), [data]);

  const hasData = breakdown.some((hour) => hour.tradeCount > 0);

  const contentInset = { top: 30, bottom: 10, left: 8, right: 8 };

  // Decorator functions for react-native-svg-charts
  // These are not React components but decorator functions called by the chart library
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

  const WinRateLabels = useMemo(
    () =>
      ({ x, y, bandwidth }: WinRateLabelsProps) =>
        breakdown.map((hour: HourBreakdown, index: number) => {
          if (hour.tradeCount === 0) return null;

          const labelY = hour.totalPnl >= 0 ? y(hour.totalPnl) - 10 : y(0) - 10;
          const labelX = x(index) + bandwidth / 2;

          return (
            <SVGText
              key={`label-${index}`}
              x={labelX}
              y={labelY}
              fontSize={9}
              fill={theme.colors.textSecondary}
              textAnchor="middle"
            >
              {hour.winRate.toFixed(0)}%
            </SVGText>
          );
        }),
    [breakdown, theme.colors.textSecondary]
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
    <SectionCard title="P&L by Hour">
      {!hasData ? (
        <CardEmptyState
          icon="clock-outline"
          title="No trading data by hour yet"
          subtitle="Add trades to see your best trading hours"
        />
      ) : (
        <>
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
                style={[
                  styles.chart,
                  { height: chartHeight, width: chartWidth },
                ]}
                data={data}
                contentInset={contentInset}
                spacingInner={0.3}
                spacingOuter={0.2}
              >
                {/* @ts-expect-error - react-native-svg-charts passes props to decorators internally */}
                <ZeroLine />
                {/* @ts-expect-error - react-native-svg-charts passes props to decorators internally */}
                <CustomBars />
                {/* @ts-expect-error - react-native-svg-charts passes props to decorators internally */}
                <WinRateLabels />
              </BarChart>
              {/* eslint-enable react-hooks/static-components */}

              {/* X-axis */}
              <XAxis
                style={styles.xAxis}
                data={data}
                formatLabel={(_, index) => labels[index]}
                contentInset={{ left: 24, right: 24 }}
                svg={{
                  fontSize: 10,
                  fill: theme.colors.textSecondary,
                }}
              />
            </View>
          </View>
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
    legend: {
      marginTop: 8,
      alignItems: 'center',
    },
    legendText: {
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
  });
