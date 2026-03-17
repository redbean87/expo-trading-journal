import React, { useMemo } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text } from 'react-native-paper';
import { Text as SVGText, Rect } from 'react-native-svg';
// @ts-expect-error - react-native-svg-charts doesn't have TypeScript definitions
import { BarChart, XAxis } from 'react-native-svg-charts';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useContentWidth } from '../../hooks/use-content-width';
import {
  HoldTimeBin,
  useHoldTimeHistogram,
} from '../../hooks/use-hold-time-histogram';
import { Trade } from '../../types';
import {
  getChartHeight,
  getChartWidth,
  Y_AXIS_LABEL_WIDTH,
} from '../../utils/chart-dimensions';

type HoldTimeHistogramCardProps = {
  trades: Trade[];
};

type CustomBarsProps = {
  x: (index: number) => number;
  y: (value: number) => number;
  bandwidth: number;
  data: number[];
};

type CountLabelsProps = {
  x: (index: number) => number;
  y: (value: number) => number;
  bandwidth: number;
};

export default function HoldTimeHistogramCard({
  trades,
}: HoldTimeHistogramCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles(theme);
  const bins = useHoldTimeHistogram(trades);

  const chartWidth = getChartWidth(contentWidth);
  const chartHeight = getChartHeight('bar', breakpoint);

  const data = useMemo(() => bins.map((bin) => bin.count), [bins]);
  const labels = useMemo(() => bins.map((bin) => bin.label), [bins]);
  const yAxisMax = useMemo(() => Math.max(...data, 1), [data]);

  const hasData = bins.some((bin) => bin.count > 0);

  const contentInset = { top: 30, bottom: 10, left: 8, right: 8 };

  // Decorator functions for react-native-svg-charts
  // These are not React components but decorator functions called by the chart library
  /* eslint-disable react-hooks/static-components */
  const CustomBars = useMemo(
    () =>
      ({ x, y, bandwidth, data: chartData }: CustomBarsProps) =>
        chartData.map((value: number, index: number) => {
          const bin: HoldTimeBin = bins[index];
          let barColor: string;
          if (value === 0) {
            barColor = theme.colors.surfaceVariant;
          } else if (bin.avgPnl > 0) {
            barColor = theme.colors.profit;
          } else if (bin.avgPnl < 0) {
            barColor = theme.colors.loss;
          } else {
            barColor = theme.colors.textSecondary;
          }

          const barHeight = Math.abs(y(value) - y(0));
          const barY = y(value);

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
    [
      bins,
      theme.colors.profit,
      theme.colors.loss,
      theme.colors.surfaceVariant,
      theme.colors.textSecondary,
    ]
  );

  const CountLabels = useMemo(
    () =>
      ({ x, y, bandwidth }: CountLabelsProps) =>
        bins.map((bin: HoldTimeBin, index: number) => {
          if (bin.count === 0) return null;

          const labelY = y(bin.count) - 6;
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
              {bin.count}
            </SVGText>
          );
        }),
    [bins, theme.colors.textSecondary]
  );
  /* eslint-enable react-hooks/static-components */

  return (
    <SectionCard title="Hold Time Distribution">
      {!hasData ? (
        <CardEmptyState
          icon="clock-outline"
          title="No hold time data yet"
          subtitle="Add trades to see how long you hold positions"
        />
      ) : (
        <>
          <View style={styles.container}>
            {/* Y-axis labels */}
            <View style={styles.yAxisContainer}>
              <RNText style={styles.yAxisLabel}>{yAxisMax}</RNText>
              <RNText style={styles.yAxisLabel}>0</RNText>
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
                yMin={0}
              >
                {/* @ts-expect-error - react-native-svg-charts passes props to decorators internally */}
                <CustomBars />
                {/* @ts-expect-error - react-native-svg-charts passes props to decorators internally */}
                <CountLabels />
              </BarChart>
              {/* eslint-enable react-hooks/static-components */}

              {/* X-axis */}
              <XAxis
                style={styles.xAxis}
                data={data}
                formatLabel={(_: unknown, index: number) => labels[index]}
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
              Bar color reflects avg P&L per bucket
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
      paddingTop: 30,
      paddingBottom: 10,
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
