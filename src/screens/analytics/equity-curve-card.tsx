import React, { useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';

import {
  LineChart,
  ChartThemeColors,
  TooltipData,
} from '../../components/charts';
import { useAppTheme } from '../../hooks/use-app-theme';
import { EquityCurveData } from '../../hooks/use-equity-curve';

type EquityCurveCardProps = {
  data: EquityCurveData;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function calculateLabelInterval(dataLength: number): number {
  if (dataLength <= 7) return 1;
  if (dataLength <= 14) return 2;
  if (dataLength <= 28) return 4;
  return Math.ceil(dataLength / 7);
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

export function EquityCurveCard({
  data,
  onInteractionStart,
  onInteractionEnd,
}: EquityCurveCardProps) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);

  const yAxisLabelWidth = 50;
  const containerWidth = width - 64;

  const isProfit = data.currentBalance >= 0;
  const lineColor = isProfit ? theme.colors.profit : theme.colors.loss;

  const labelInterval = calculateLabelInterval(data.dataPoints.length);

  const chartData = data.dataPoints.map((point, index) => ({
    value: point.cumulativePnl,
    label: index % labelInterval === 0 ? formatDate(point.date) : '',
    date: point.date,
  }));

  const chartColors: ChartThemeColors = {
    lineColor,
    gradientStartColor: lineColor,
    gradientEndColor: theme.colors.background,
    backgroundColor: theme.colors.surface,
    axisColor: theme.colors.border,
    axisTextColor: theme.colors.textSecondary,
    tooltipBackgroundColor: theme.colors.surface,
    tooltipBorderColor: theme.colors.border,
  };

  const handleTooltipShow = useCallback(() => {
    onInteractionStart?.();
  }, [onInteractionStart]);

  const handleTooltipHide = useCallback(() => {
    onInteractionEnd?.();
  }, [onInteractionEnd]);

  const renderTooltip = useCallback(
    (tooltipData: TooltipData) => {
      const isPositive = tooltipData.value >= 0;
      const valueColor = isPositive ? theme.colors.profit : theme.colors.loss;

      return (
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipDate}>
            {formatFullDate(tooltipData.date)}
          </Text>
          <Text style={[styles.tooltipValue, { color: valueColor }]}>
            {formatCurrency(tooltipData.value)}
          </Text>
        </View>
      );
    },
    [theme, styles]
  );

  return (
    <Card style={styles.card}>
      <Card.Title title="Equity Curve" />
      <Card.Content>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={containerWidth}
            height={180}
            colors={chartColors}
            yAxisLabelPrefix="$"
            yAxisLabelWidth={yAxisLabelWidth}
            curved
            areaFill
            areaStartOpacity={0.3}
            areaEndOpacity={0.05}
            numberOfYSections={4}
            onTooltipShow={handleTooltipShow}
            onTooltipHide={handleTooltipHide}
            renderTooltip={renderTooltip}
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
