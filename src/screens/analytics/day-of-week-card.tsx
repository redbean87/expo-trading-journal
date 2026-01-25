import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card, Text } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';
import { useDayOfWeekBreakdown } from '../../hooks/use-day-of-week-breakdown';
import { Trade } from '../../types';

type DayOfWeekCardProps = {
  trades: Trade[];
};

export function DayOfWeekCard({ trades }: DayOfWeekCardProps) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);
  const breakdown = useDayOfWeekBreakdown(trades);

  const yAxisLabelWidth = 50;
  const chartWidth = width - 64 - yAxisLabelWidth;
  const barWidth = Math.floor((chartWidth - 70) / 7);

  const chartData = breakdown.map((day) => ({
    value: day.totalPnl,
    label: day.dayLabel,
    frontColor: day.totalPnl >= 0 ? theme.colors.profit : theme.colors.loss,
    topLabelComponent: () =>
      day.tradeCount > 0 ? (
        <Text style={styles.topLabel}>{day.winRate.toFixed(0)}%</Text>
      ) : null,
  }));

  const hasData = breakdown.some((day) => day.tradeCount > 0);

  if (!hasData) {
    return null;
  }

  const axisTextStyle = {
    color: theme.colors.textSecondary,
    fontSize: 10,
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="P&L by Day of Week" />
      <Card.Content>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            height={160}
            width={chartWidth}
            barWidth={barWidth}
            spacing={10}
            initialSpacing={10}
            noOfSections={4}
            yAxisTextStyle={axisTextStyle}
            xAxisLabelTextStyle={axisTextStyle}
            backgroundColor={theme.colors.surface}
            rulesColor={theme.colors.border}
            yAxisColor={theme.colors.border}
            xAxisColor={theme.colors.border}
            yAxisLabelPrefix="$"
            yAxisLabelWidth={yAxisLabelWidth}
            disableScroll
            hideRules={false}
            roundedTop
          />
        </View>
        <View style={styles.legend}>
          <Text variant="bodySmall" style={styles.legendText}>
            Win rate shown above each bar
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
