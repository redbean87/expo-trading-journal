import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card, Text } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';
import { EquityCurveData } from '../../hooks/use-equity-curve';

type EquityCurveCardProps = {
  data: EquityCurveData;
};

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function calculateLabelInterval(dataLength: number): number {
  if (dataLength <= 5) return 1;
  if (dataLength <= 10) return 2;
  if (dataLength <= 20) return 4;
  return Math.ceil(dataLength / 5);
}

export function EquityCurveCard({ data }: EquityCurveCardProps) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);

  // Account for card padding (16*2), content padding, and y-axis labels
  const yAxisLabelWidth = 50;
  const containerWidth = width - 64;
  const chartAreaWidth = containerWidth - yAxisLabelWidth;

  const isProfit = data.currentBalance >= 0;
  const lineColor = isProfit ? theme.colors.profit : theme.colors.loss;

  const labelInterval = calculateLabelInterval(data.dataPoints.length);

  const chartData = data.dataPoints.map((point, index) => ({
    value: point.cumulativePnl,
    label: index % labelInterval === 0 ? formatDate(point.date) : '',
    date: point.date,
  }));

  const spacing =
    chartData.length > 1 ? chartAreaWidth / (chartData.length - 1) : 0;

  return (
    <Card style={styles.card}>
      <Card.Title title="Equity Curve" />
      <Card.Content>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            height={180}
            color={lineColor}
            areaChart
            startFillColor={lineColor}
            endFillColor={theme.colors.background}
            startOpacity={0.3}
            endOpacity={0.05}
            curved
            hideDataPoints
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            backgroundColor={theme.colors.surface}
            rulesColor={theme.colors.border}
            yAxisColor={theme.colors.border}
            xAxisColor={theme.colors.border}
            noOfSections={4}
            yAxisLabelPrefix="$"
            yAxisLabelWidth={yAxisLabelWidth}
            spacing={spacing}
            initialSpacing={0}
            endSpacing={0}
            disableScroll
          />
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
      marginLeft: -10,
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
    axisText: {
      color: theme.colors.textSecondary,
      fontSize: 10,
    },
    drawdownValue: {
      color: theme.colors.loss,
    },
  });
