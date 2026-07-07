import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
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

  const hasData = chartData.length > 0;

  return (
    <SectionCard title="Equity Curve">
      {!hasData ? (
        <CardEmptyState
          icon="chart-line"
          title="No equity curve data yet"
          subtitle="Start trading to track your equity growth"
        />
      ) : (
        <>
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
                  labelStyle={{
                    color: theme.colors.textSecondary,
                    fontSize: 11,
                  }}
                  formatter={(value: number | undefined) => [
                    `$${value !== undefined && value >= 0 ? '' : '-'}${value !== undefined ? Math.abs(value).toFixed(2) : '0.00'}`,
                    'Cumulative PnL',
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
                  dataKey="cumulativePnl"
                  stroke={lineColor}
                  strokeWidth={2}
                  fill="url(#equityFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </View>
          {data.dataPoints.length > 0 && (
            <View style={styles.stats}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Final PnL:{' '}
                <Text
                  style={[
                    styles.balanceValue,
                    data.currentBalance >= 0
                      ? styles.profitValue
                      : styles.lossValue,
                  ]}
                >
                  {data.currentBalance >= 0 ? '+' : '-'}$
                  {Math.abs(data.currentBalance).toFixed(2)}
                </Text>
                {' | Days: '}
                {data.tradingDays}
                {' | Best: '}
                <Text style={[styles.balanceValue, styles.profitValue]}>
                  +${Math.abs(data.bestDay).toFixed(0)}
                </Text>
                {' | Worst: '}
                <Text style={[styles.balanceValue, styles.lossValue]}>
                  -${Math.abs(data.worstDay).toFixed(0)}
                </Text>
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
    balanceValue: {
      fontWeight: '600',
    },
    profitValue: {
      color: theme.colors.profit,
    },
    lossValue: {
      color: theme.colors.loss,
    },
  });
