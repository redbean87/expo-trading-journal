import * as shape from 'd3-shape';
import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  type LayoutChangeEvent,
} from 'react-native';
import { Card, Text } from 'react-native-paper';
import { AreaChart, YAxis, XAxis } from 'react-native-svg-charts';

import { CardEmptyState } from '../../components/card-empty-state';
import { DataPointTooltip } from '../../components/data-point-tooltip';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { EquityCurveData } from '../../hooks/use-equity-curve';
import {
  getChartHeight,
  Y_AXIS_LABEL_WIDTH,
} from '../../utils/chart-dimensions';
import { formatDate } from '../../utils/date-format';
import { formatCurrency } from '../../utils/format-pnl';

type EquityCurveCardProps = {
  data: EquityCurveData;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

type ChartDataItem = {
  index: number;
  cumulativePnl: number;
};

// Native implementation using react-native-svg-charts
export default function EquityCurveCard({
  data,
  onInteractionStart,
  onInteractionEnd,
}: EquityCurveCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);

  const chartHeight = getChartHeight('line', breakpoint);

  const isProfit = data.currentBalance >= 0;
  const lineColor = isProfit ? theme.colors.profit : theme.colors.loss;

  const chartData: ChartDataItem[] = data.dataPoints.map((point, index) => ({
    index,
    cumulativePnl: point.cumulativePnl,
  }));

  const contentInset = useMemo(
    () => ({
      top: 12,
      bottom: 12,
      left: 8,
      right: 8,
    }),
    []
  );

  const yAxisInset = { top: 12, bottom: 12 };

  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [chartLayout, setChartLayout] = useState({ width: 0, x: 0 });

  const handleChartLayout = (e: LayoutChangeEvent) => {
    const { width, x } = e.nativeEvent.layout;
    setChartLayout({ width, x });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          onInteractionStart?.();
          const locationX = evt.nativeEvent.locationX;
          const { width } = chartLayout;
          const dataWidth =
            width - (contentInset.left ?? 0) - (contentInset.right ?? 0);
          const n = chartData.length;
          if (n === 0 || dataWidth <= 0) return;
          if (n === 1) {
            setActivePointIndex(0);
            return;
          }
          const rawIndex =
            ((locationX - (contentInset.left ?? 0)) / dataWidth) * (n - 1);
          const index = Math.round(Math.max(0, Math.min(n - 1, rawIndex)));
          setActivePointIndex(index);
        },
        onPanResponderMove: (evt) => {
          const locationX = evt.nativeEvent.locationX;
          const { width } = chartLayout;
          const dataWidth =
            width - (contentInset.left ?? 0) - (contentInset.right ?? 0);
          const n = chartData.length;
          if (n <= 1 || dataWidth <= 0) return;
          const rawIndex =
            ((locationX - (contentInset.left ?? 0)) / dataWidth) * (n - 1);
          const index = Math.round(Math.max(0, Math.min(n - 1, rawIndex)));
          setActivePointIndex(index);
        },
        onPanResponderRelease: () => {
          setActivePointIndex(null);
          onInteractionEnd?.();
        },
        onPanResponderTerminate: () => {
          setActivePointIndex(null);
          onInteractionEnd?.();
        },
      }),
    [
      chartLayout,
      chartData.length,
      contentInset,
      onInteractionStart,
      onInteractionEnd,
    ]
  );

  const point =
    activePointIndex != null ? data.dataPoints[activePointIndex] : null;

  const hasData = data.dataPoints.length > 0;

  return (
    <Card style={styles.card}>
      <Card.Title title="Equity Curve" />
      <Card.Content>
        {!hasData ? (
          <CardEmptyState
            icon="chart-line"
            title="No equity curve data yet"
            subtitle="Start trading to track your equity growth"
          />
        ) : (
          <>
            <View style={styles.chartRow}>
              <YAxis
                data={chartData}
                yAccessor={({ item }) => (item as ChartDataItem).cumulativePnl}
                numberOfTicks={4}
                contentInset={yAxisInset}
                style={styles.yAxis}
                formatLabel={(value: number) => `$${value.toFixed(0)}`}
                svg={{
                  fontSize: 10,
                  fill: theme.colors.textSecondary,
                }}
              />
              <View
                style={styles.chartWrapper}
                onLayout={handleChartLayout}
                {...panResponder.panHandlers}
              >
                {point && (
                  <View style={styles.tooltipWrapper} pointerEvents="none">
                    <DataPointTooltip
                      label={formatDate(point.date)}
                      value={formatCurrency(point.cumulativePnl)}
                      valueColor={
                        point.cumulativePnl >= 0
                          ? theme.colors.profit
                          : theme.colors.loss
                      }
                    />
                  </View>
                )}
                <AreaChart
                  data={chartData}
                  xAccessor={({ index }) => index}
                  yAccessor={({ item }) =>
                    (item as ChartDataItem).cumulativePnl
                  }
                  contentInset={contentInset}
                  style={[styles.chart, { height: chartHeight }]}
                  curve={shape.curveNatural}
                  start={0}
                  svg={{
                    fill: lineColor,
                    fillOpacity: 0.3,
                    stroke: lineColor,
                    strokeWidth: 2,
                  }}
                />
                <XAxis
                  data={chartData}
                  xAccessor={({ index }) => index}
                  contentInset={{
                    left: contentInset.left,
                    right: contentInset.right,
                  }}
                  numberOfTicks={5}
                  style={styles.xAxis}
                  formatLabel={(value: number, _tickIndex: number) => {
                    const point = data.dataPoints[value];
                    return point
                      ? `${point.date.getMonth() + 1}/${point.date.getDate()}`
                      : '';
                  }}
                  svg={{
                    fontSize: 10,
                    fill: theme.colors.textSecondary,
                  }}
                />
              </View>
            </View>
            {data.maxDrawdown > 0 && (
              <View style={styles.stats}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Max Drawdown:{' '}
                  <Text style={styles.drawdownValue}>
                    -${data.maxDrawdown.toFixed(2)} (
                    {data.maxDrawdownPercent.toFixed(1)}%)
                  </Text>
                </Text>
              </View>
            )}
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      marginBottom: 16,
    },
    chartRow: {
      flexDirection: 'row',
      height: 'auto',
    },
    yAxis: {
      width: Y_AXIS_LABEL_WIDTH,
      marginBottom: 24,
    },
    chartWrapper: {
      flex: 1,
      marginLeft: 4,
      position: 'relative',
    },
    tooltipWrapper: {
      position: 'absolute',
      top: 8,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 1,
    },
    chart: {
      width: '100%',
    },
    xAxis: {
      height: 24,
      marginHorizontal: 0,
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
