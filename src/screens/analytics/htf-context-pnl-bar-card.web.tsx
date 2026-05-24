import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { HtfContextMetrics } from '../../hooks/use-htf-context-analytics';
import { getChartHeight } from '../../utils/chart-dimensions';

type HtfContextPnlBarCardProps = {
  contexts: HtfContextMetrics[];
  availableWidth?: number;
};

export default function HtfContextPnlBarCard({
  contexts,
}: HtfContextPnlBarCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = createStyles(theme);

  const chartHeight = getChartHeight('bar', breakpoint);

  const hasData = contexts.length > 0 && contexts.some((c) => c.tradeCount > 0);

  const chartData = contexts.map((c) => ({
    name: c.name.length > 6 ? c.name.slice(0, 5) + '…' : c.name,
    value: c.totalPnl,
  }));

  const Recharts = require('recharts');
  const { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } = Recharts;

  return (
    <SectionCard title="P&L by HTF Context">
      {!hasData ? (
        <CardEmptyState
          icon="chart-bar"
          title="No HTF context P&L data yet"
          subtitle="Tag your trades with an HTF context to compare performance"
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
