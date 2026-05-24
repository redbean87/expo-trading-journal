import * as d3Scale from 'd3-scale';
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
import { HtfContextMetrics } from '../../hooks/use-htf-context-analytics';
import {
  getChartHeight,
  getChartWidth,
  Y_AXIS_LABEL_WIDTH,
} from '../../utils/chart-dimensions';

type HtfContextPnlBarCardProps = {
  contexts: HtfContextMetrics[];
  availableWidth?: number;
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

export default function HtfContextPnlBarCard({
  contexts,
  availableWidth,
}: HtfContextPnlBarCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles(theme);

  const chartWidth = getChartWidth(availableWidth ?? contentWidth);
  const chartHeight = getChartHeight('bar', breakpoint);

  const data = useMemo(() => contexts.map((c) => c.totalPnl), [contexts]);

  const labels = useMemo(
    () =>
      contexts.map((c) =>
        c.name.length > 6 ? c.name.slice(0, 5) + '…' : c.name
      ),
    [contexts]
  );

  const yAxisMax = useMemo(
    () => (data.length > 0 ? Math.max(...data).toFixed(0) : '0'),
    [data]
  );
  const yAxisMin = useMemo(
    () => (data.length > 0 ? Math.min(...data).toFixed(0) : '0'),
    [data]
  );

  const labelStep = data.length > 6 ? 2 : 1;

  const contentInset = { top: 30, bottom: 10, left: 8, right: 8 };

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
    <SectionCard title="P&L by HTF Context">
      {data.length === 0 ? (
        <CardEmptyState
          icon="chart-bar"
          title="No HTF context P&L data yet"
          subtitle="Tag your trades with an HTF context to compare performance"
        />
      ) : (
        <View style={styles.container}>
          <View style={styles.yAxisContainer}>
            <RNText style={styles.yAxisLabel}>{yAxisMax}</RNText>
            <RNText style={styles.yAxisLabel}>0</RNText>
            <RNText style={styles.yAxisLabel}>{yAxisMin}</RNText>
          </View>

          <View style={styles.chartWrapper}>
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

            <XAxis
              style={styles.xAxis}
              data={data}
              scale={d3Scale.scaleBand}
              formatLabel={(_: unknown, index: number) =>
                index % labelStep === 0 ? labels[index] : ''
              }
              spacingInner={0.3}
              spacingOuter={0.2}
              contentInset={{ left: 8, right: 8 }}
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
