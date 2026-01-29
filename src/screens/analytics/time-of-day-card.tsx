import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card, Text } from 'react-native-paper';

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

export function TimeOfDayCard({ trades }: TimeOfDayCardProps) {
  const theme = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles(theme);
  const breakdown = useTimeOfDayBreakdown(trades);

  const chartWidth = getChartWidth(contentWidth);
  const chartHeight = getChartHeight('bar', breakpoint);
  const barCount = breakdown.length || 1;
  // Use fixed bar width, enable scroll if many bars
  const barWidth = 28;
  const spacing = 8;
  const needsScroll = barCount > 7;

  const chartData = breakdown.map((hour) => ({
    value: hour.totalPnl,
    label: hour.hourLabel,
    frontColor: hour.totalPnl >= 0 ? theme.colors.profit : theme.colors.loss,
    topLabelComponent: () =>
      hour.tradeCount > 0 ? (
        <Text style={styles.topLabel}>{hour.winRate.toFixed(0)}%</Text>
      ) : null,
  }));

  if (breakdown.length === 0) {
    return null;
  }

  const axisTextStyle = {
    color: theme.colors.textSecondary,
    fontSize: 10,
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="P&L by Hour" />
      <Card.Content>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            height={chartHeight}
            width={chartWidth}
            barWidth={barWidth}
            spacing={spacing}
            initialSpacing={10}
            noOfSections={4}
            yAxisTextStyle={axisTextStyle}
            xAxisLabelTextStyle={axisTextStyle}
            backgroundColor={theme.colors.surface}
            rulesColor={theme.colors.border}
            yAxisColor={theme.colors.border}
            xAxisColor={theme.colors.border}
            yAxisLabelPrefix="$"
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            disableScroll={!needsScroll}
            hideRules={false}
            roundedTop
          />
        </View>
        <View style={styles.legend}>
          <Text variant="bodySmall" style={styles.legendText}>
            Win rate shown above each bar
            {needsScroll ? ' • Scroll for more' : ''}
          </Text>
        </View>
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
      marginLeft: -10,
    },
    topLabel: {
      fontSize: 9,
      color: theme.colors.textSecondary,
      marginBottom: 2,
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
