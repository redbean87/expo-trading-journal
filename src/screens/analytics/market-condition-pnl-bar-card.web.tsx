import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { MarketConditionMetrics } from '../../hooks/use-market-condition-analytics';
import { getChartHeight } from '../../utils/chart-dimensions';

type MarketConditionPnlBarCardProps = {
  conditions: MarketConditionMetrics[];
  availableWidth?: number;
};

export default function MarketConditionPnlBarCard({
  conditions,
}: MarketConditionPnlBarCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);

  const chartHeight = getChartHeight('bar', breakpoint);

  const hasData =
    conditions.length > 0 && conditions.some((c) => c.tradeCount > 0);

  const chartData = conditions.map((c) => ({
    name: c.name.length > 6 ? c.name.slice(0, 5) + '…' : c.name,
    value: c.totalPnl,
  }));

  const Recharts = require('recharts');
  const { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } = Recharts;

  return (
    <SectionCard title="P&L by Market Condition">
      {!hasData ? (
        <CardEmptyState
          icon="chart-bar"
          title="No market condition P&L data yet"
          subtitle="Tag your trades with a market condition to compare performance"
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
                tickFormatter={(value: number) => `$${value}`}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.value >= 0 ? theme.colors.profit : theme.colors.loss
                    }
                  />
                ))}
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
