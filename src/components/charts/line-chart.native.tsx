import { LinearGradient, vec } from '@shopify/react-native-skia';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CartesianChart, Line, Area, useChartPressState } from 'victory-native';

import { LineChartProps, TooltipData } from './types';

type VictoryDataPoint = {
  x: number;
  value: number;
  label: string;
  date: Date;
};

export function LineChart({
  data,
  width,
  height,
  colors,
  yAxisLabelPrefix = '',
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
  const { state, isActive } = useChartPressState<{
    x: number;
    y: { value: number };
  }>({
    x: 0,
    y: { value: 0 },
  });

  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const lastIndexRef = useRef<number | null>(null);
  const dataRef = useRef(data);
  const onTooltipShowRef = useRef(onTooltipShow);
  const onTooltipHideRef = useRef(onTooltipHide);

  // Update refs in layout effect (synchronous but outside render)
  useLayoutEffect(() => {
    dataRef.current = data;
    onTooltipShowRef.current = onTooltipShow;
    onTooltipHideRef.current = onTooltipHide;
  });

  // Transform data for Victory format
  const chartData: VictoryDataPoint[] = data.map((point, index) => ({
    x: index,
    value: point.value,
    label: point.label,
    date: point.date,
  }));

  // Calculate x-axis label interval based on data length
  const xTickCount = Math.min(7, data.length);

  // Handle tooltip state changes in an effect
  useEffect(() => {
    if (isActive && state.x.value !== undefined) {
      const index = Math.round(state.x.value.value);
      if (
        index !== lastIndexRef.current &&
        index >= 0 &&
        index < dataRef.current.length
      ) {
        lastIndexRef.current = index;
        const point = dataRef.current[index];
        if (point) {
          const newTooltipData: TooltipData = {
            value: point.value,
            date: point.date,
            x: state.x.position.value,
            y: state.y.value.position.value,
          };
          setTooltipData(newTooltipData);
          onTooltipShowRef.current?.(newTooltipData);
        }
      }
    } else if (!isActive && lastIndexRef.current !== null) {
      lastIndexRef.current = null;
      setTooltipData(null);
      onTooltipHideRef.current?.();
    }
  }, [isActive, state.x.value, state.x.position, state.y.value.position]);

  if (data.length === 0) {
    return <View style={[styles.container, { width, height }, style]} />;
  }

  const curveType = curved ? 'natural' : 'linear';

  return (
    <View style={[styles.container, { width, height }, style]}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['value']}
        chartPressState={state}
        axisOptions={{
          tickCount: { x: xTickCount, y: numberOfYSections + 1 },
          formatXLabel: (value) => {
            const index = Math.round(value);
            const point = data[index];
            return point?.label || '';
          },
          formatYLabel: (value) => `${yAxisLabelPrefix}${Math.round(value)}`,
          labelColor: colors.axisTextColor,
          lineColor: colors.axisColor,
        }}
        domainPadding={{ left: 10, right: 10, top: 20, bottom: 10 }}
      >
        {({ points, chartBounds }) => (
          <>
            {areaFill && (
              <Area
                points={points.value}
                y0={chartBounds.bottom}
                curveType={curveType}
                animate={{ type: 'timing', duration: 300 }}
              >
                <LinearGradient
                  start={vec(0, chartBounds.top)}
                  end={vec(0, chartBounds.bottom)}
                  colors={[
                    withOpacity(colors.gradientStartColor, areaStartOpacity),
                    withOpacity(colors.gradientEndColor, areaEndOpacity),
                  ]}
                />
              </Area>
            )}
            <Line
              points={points.value}
              color={colors.lineColor}
              strokeWidth={2}
              curveType={curveType}
              animate={{ type: 'timing', duration: 300 }}
            />
          </>
        )}
      </CartesianChart>

      {renderTooltip && tooltipData && isActive && (
        <View
          style={[
            styles.tooltipWrapper,
            {
              left: Math.max(10, Math.min(tooltipData.x - 60, width - 130)),
              top: Math.max(10, tooltipData.y - 70),
            },
          ]}
        >
          {renderTooltip(tooltipData)}
        </View>
      )}
    </View>
  );
}

function withOpacity(color: string, opacity: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Handle rgb colors
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }
  // Handle rgba colors - replace existing opacity
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
  }
  return color;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tooltipWrapper: {
    position: 'absolute',
    zIndex: 100,
  },
});
