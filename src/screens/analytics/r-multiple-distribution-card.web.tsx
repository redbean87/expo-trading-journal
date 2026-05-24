import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useRMultipleDistribution } from '../../hooks/use-r-multiple-distribution';
import { Trade } from '../../types';
import { getChartHeight } from '../../utils/chart-dimensions';

type RMultipleDistributionCardProps = {
  trades: Trade[];
};

export default function RMultipleDistributionCard({
  trades,
}: RMultipleDistributionCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);
  const bins = useRMultipleDistribution(trades);

  const chartHeight = getChartHeight('bar', breakpoint);

  const hasData = bins.some((bin) => bin.count > 0);

  const chartData = bins.map((bin) => ({
    name: bin.label,
    value: bin.count,
    isProfit: bin.isProfit,
  }));

  const Recharts = require('recharts');
  const { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } = Recharts;

  return (
    <SectionCard title="R-Multiple Distribution">
      {!hasData ? (
        <CardEmptyState
          icon="chart-bar"
          title="No R-Multiple Data"
          subtitle="Add a risk amount when logging trades to see R-multiple distribution"
        />
      ) : (
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
                  } else if (entry.isProfit) {
                    fill = theme.colors.profit;
                  } else {
                    fill = theme.colors.loss;
                  }
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </View>
      )}
    </SectionCard>
  );
}

const createStyles = (_theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    chartContainer: {
      marginLeft: -10,
    },
  });
