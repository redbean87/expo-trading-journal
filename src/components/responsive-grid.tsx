import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Breakpoint, useBreakpoint } from '../hooks/use-breakpoint';

type ColumnConfig = {
  mobile?: number;
  tablet?: number;
  desktop?: number;
};

type ResponsiveGridProps = {
  children: ReactNode;
  columns?: ColumnConfig;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_COLUMNS: Required<ColumnConfig> = {
  mobile: 1,
  tablet: 2,
  desktop: 4,
};

const DEFAULT_GAP = 12;

function getColumnCount(breakpoint: Breakpoint, columns: ColumnConfig): number {
  return columns[breakpoint] ?? DEFAULT_COLUMNS[breakpoint];
}

export function ResponsiveGrid({
  children,
  columns = DEFAULT_COLUMNS,
  gap = DEFAULT_GAP,
  style,
}: ResponsiveGridProps) {
  const { breakpoint } = useBreakpoint();

  const columnCount = getColumnCount(breakpoint, columns);

  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.container, { gap }, style]}>
      {childArray.map((child, index) => (
        <View
          key={index}
          style={{
            width: `${100 / columnCount}%` as unknown as ViewStyle['width'],
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
