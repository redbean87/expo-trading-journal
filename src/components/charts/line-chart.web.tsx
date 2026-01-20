import React, { useCallback, useId, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { LineChartProps, TooltipData } from './types';

type RechartsDataPoint = {
  index: number;
  value: number;
  label: string;
  date: Date;
};

type _TooltipPayload = {
  payload: RechartsDataPoint;
};

export function LineChart({
  data,
  width,
  height,
  colors,
  yAxisLabelPrefix = '',
  yAxisLabelWidth = 50,
  curved = true,
  areaFill = true,
  areaStartOpacity = 0.3,
  areaEndOpacity = 0.05,
  numberOfYSections = 4,
  onTooltipShow,
  onTooltipHide,
  renderTooltip,
  style,
}: LineChartProps) {
  const gradientId = useId();

  // Transform data for Recharts format
  const chartData: RechartsDataPoint[] = useMemo(
    () =>
      data.map((point, index) => ({
        index,
        value: point.value,
        label: point.label,
        date: point.date,
      })),
    [data]
  );

  const handleMouseMove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => {
      if (state?.activePayload && state.activePayload.length > 0) {
        const payload = state.activePayload[0].payload as RechartsDataPoint;
        const tooltipData: TooltipData = {
          value: payload.value,
          date: payload.date,
          x: 0,
          y: 0,
        };
        onTooltipShow?.(tooltipData);
      }
    },
    [onTooltipShow]
  );

  const handleMouseLeave = useCallback(() => {
    onTooltipHide?.();
  }, [onTooltipHide]);

  const formatYAxis = useCallback(
    (value: number) => `${yAxisLabelPrefix}${Math.round(value)}`,
    [yAxisLabelPrefix]
  );

  // Create tooltip content renderer - returns JSX element, not a component
  const createTooltipContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      if (!renderTooltip) return null;
      const { active, payload } = props;
      if (active && payload && payload.length > 0) {
        const tooltipPayload = payload[0].payload as RechartsDataPoint;
        return renderTooltip({
          value: tooltipPayload.value,
          date: tooltipPayload.date,
          x: 0,
          y: 0,
        });
      }
      return null;
    },
    [renderTooltip]
  );

  if (data.length === 0) {
    return <View style={[styles.container, { width, height }, style]} />;
  }

  const curveType = curved ? 'monotone' : 'linear';

  return (
    <View style={[styles.container, { width, height }, style]}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={colors.gradientStartColor}
                stopOpacity={areaStartOpacity}
              />
              <stop
                offset="100%"
                stopColor={colors.gradientEndColor}
                stopOpacity={areaEndOpacity}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={{ stroke: colors.axisColor }}
            tickLine={{ stroke: colors.axisColor }}
            tick={{ fill: colors.axisTextColor, fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            axisLine={{ stroke: colors.axisColor }}
            tickLine={{ stroke: colors.axisColor }}
            tick={{ fill: colors.axisTextColor, fontSize: 10 }}
            tickCount={numberOfYSections + 1}
            width={yAxisLabelWidth}
          />
          {renderTooltip && (
            <Tooltip
              content={createTooltipContent}
              cursor={{ stroke: colors.axisColor, strokeDasharray: '3 3' }}
            />
          )}
          <Area
            type={curveType}
            dataKey="value"
            stroke={colors.lineColor}
            strokeWidth={2}
            fill={areaFill ? `url(#${gradientId})` : 'transparent'}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
