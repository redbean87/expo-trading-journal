import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
} from 'recharts';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useHoldTimeHistogram } from '../../hooks/use-hold-time-histogram';
import { Trade } from '../../types';
import { getChartHeight } from '../../utils/chart-dimensions';

type HoldTimeHistogramCardProps = {
  trades: Trade[];
};

export default function HoldTimeHistogramCard({
  trades,
}: HoldTimeHistogramCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);
  const bins = useHoldTimeHistogram(trades);

  const chartHeight = getChartHeight('bar', breakpoint);

  const hasData = bins.some((bin) => bin.count > 0);

  const chartData = bins.map((bin) => ({
    name: bin.label,
    value: bin.count,
    avgPnl: bin.avgPnl,
  }));

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
          <View style={[styles.chartContainer, { height: chartHeight }]}>
            <ResponsiveContainer width="100%" height="100%">
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
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => {
                    let fill: string;
                    if (entry.value === 0) {
                      fill = theme.colors.surfaceVariant;
                    } else if (entry.avgPnl > 0) {
                      fill = theme.colors.profit;
                    } else if (entry.avgPnl < 0) {
                      fill = theme.colors.loss;
                    } else {
                      fill = theme.colors.textSecondary;
                    }
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
