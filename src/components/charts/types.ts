import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type ChartDataPoint = {
  value: number;
  label: string;
  date: Date;
};

export type ChartThemeColors = {
  lineColor: string;
  gradientStartColor: string;
  gradientEndColor: string;
  backgroundColor: string;
  axisColor: string;
  axisTextColor: string;
  tooltipBackgroundColor: string;
  tooltipBorderColor: string;
};

export type TooltipData = {
  value: number;
  date: Date;
  x: number;
  y: number;
};

export type LineChartProps = {
  data: ChartDataPoint[];
  width: number;
  height: number;
  colors: ChartThemeColors;
  yAxisLabelPrefix?: string;
  yAxisLabelWidth?: number;
  curved?: boolean;
  areaFill?: boolean;
  areaStartOpacity?: number;
  areaEndOpacity?: number;
  numberOfYSections?: number;
  onTooltipShow?: (data: TooltipData) => void;
  onTooltipHide?: () => void;
  renderTooltip?: (data: TooltipData) => ReactNode;
  style?: StyleProp<ViewStyle>;
};
