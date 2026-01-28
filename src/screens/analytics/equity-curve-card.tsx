import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card, Text } from 'react-native-paper';

import { useAppTheme } from '../../hooks/use-app-theme';
import { useContentWidth } from '../../hooks/use-content-width';
import { EquityCurveData } from '../../hooks/use-equity-curve';

type EquityCurveCardProps = {
  data: EquityCurveData;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

type ChartDataItem = {
  value: number;
  label: string;
  date: Date;
};

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(value: number): string {
  const prefix = value >= 0 ? '' : '-';
  return `${prefix}$${Math.abs(value).toFixed(2)}`;
}

function calculateLabelInterval(dataLength: number): number {
  if (dataLength <= 7) return 1;
  if (dataLength <= 14) return 2;
  if (dataLength <= 28) return 4;
  return Math.ceil(dataLength / 7);
}

export function EquityCurveCard({
  data,
  onInteractionStart,
  onInteractionEnd,
}: EquityCurveCardProps) {
  const theme = useAppTheme();
  const contentWidth = useContentWidth();
  const styles = createStyles(theme);

  const yAxisLabelWidth = 50;
  const chartWidth = contentWidth - 64 - yAxisLabelWidth;

  const isProfit = data.currentBalance >= 0;
  const lineColor = isProfit ? theme.colors.profit : theme.colors.loss;

  const labelInterval = calculateLabelInterval(data.dataPoints.length);
  const spacing =
    data.dataPoints.length > 1
      ? chartWidth / (data.dataPoints.length - 1)
      : chartWidth;

  const chartData = data.dataPoints.map((point, index) => ({
    value: point.cumulativePnl,
    label: index % labelInterval === 0 ? formatDate(point.date) : '',
    date: point.date,
  }));

  const axisTextStyle = {
    color: theme.colors.textSecondary,
    fontSize: 10,
  };

  const renderPointerLabel = (items: ChartDataItem[]) => {
    const item = items[0];
    const isPositive = item.value >= 0;
    const valueColor = isPositive ? theme.colors.profit : theme.colors.loss;

    return (
      <View style={styles.tooltipContainer}>
        <Text style={styles.tooltipDate}>{formatFullDate(item.date)}</Text>
        <Text style={[styles.tooltipValue, { color: valueColor }]}>
          {formatCurrency(item.value)}
        </Text>
      </View>
    );
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="Equity Curve" />
      <Card.Content>
        <View
          style={styles.chartContainer}
          onTouchStart={onInteractionStart}
          onTouchEnd={onInteractionEnd}
          onTouchCancel={onInteractionEnd}
        >
          <LineChart
            data={chartData}
            height={180}
            width={chartWidth}
            color={lineColor}
            areaChart
            startFillColor={lineColor}
            endFillColor={theme.colors.background}
            startOpacity={0.3}
            endOpacity={0.05}
            curved
            hideDataPoints
            yAxisTextStyle={axisTextStyle}
            xAxisLabelTextStyle={axisTextStyle}
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
            pointerConfig={{
              pointerStripHeight: 180,
              pointerStripColor: 'transparent',
              pointerStripWidth: 1,
              pointerColor: lineColor,
              radius: 6,
              pointerLabelWidth: 120,
              pointerLabelHeight: 50,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: renderPointerLabel,
            }}
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
    drawdownValue: {
      color: theme.colors.loss,
    },
    tooltipContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tooltipDate: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    tooltipValue: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
