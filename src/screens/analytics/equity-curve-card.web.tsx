import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { EquityCurveData } from '../../hooks/use-equity-curve';
import { getChartHeight } from '../../utils/chart-dimensions';

type EquityCurveCardProps = {
  data: EquityCurveData;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

type RechartsDataItem = {
  index: number;
  date: string;
  cumulativePnl: number;
  fullDate: string;
};

// Web implementation using recharts
export default function EquityCurveCard({
  data,
  onInteractionStart,
  onInteractionEnd,
}: EquityCurveCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);

  const chartHeight = getChartHeight('line', breakpoint);

  const chartData: RechartsDataItem[] = data.dataPoints.map((point, index) => ({
    index,
    date: `${point.date.getMonth() + 1}/${point.date.getDate()}`,
    cumulativePnl: point.cumulativePnl,
    fullDate: point.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

  const isProfit = data.currentBalance >= 0;
  const lineColor = isProfit ? theme.colors.profit : theme.colors.loss;

  const Recharts = require('recharts');
  const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } =
    Recharts;

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="Equity Curve" />
      <Card.Content>
        <View
          style={[styles.chartContainer, { height: chartHeight }]}
          onTouchStart={onInteractionStart}
          onTouchEnd={onInteractionEnd}
          onTouchCancel={onInteractionEnd}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop
                    offset="100%"
                    stopColor={lineColor}
                    stopOpacity={0.05}
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
                tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 8,
                }}
                labelStyle={{ color: theme.colors.textSecondary, fontSize: 11 }}
                formatter={(value: number) => [
                  `$${value >= 0 ? '' : '-'}${Math.abs(value).toFixed(2)}`,
                  'Cumulative PnL',
                ]}
                labelFormatter={(
                  label: string,
                  payload: { payload?: RechartsDataItem }[]
                ) => {
                  const p = payload?.[0]?.payload;
                  return p?.fullDate ?? label;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#equityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
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
      </Card.Content>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      marginBottom: 16,
    },
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
