import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { useBreakpoint } from '../hooks/use-breakpoint';

const DEFAULT_MAX_WIDTH = 1200;

type ResponsiveContainerProps = {
  children: ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function ResponsiveContainer({
  children,
  maxWidth = DEFAULT_MAX_WIDTH,
  style,
}: ResponsiveContainerProps) {
  const { isDesktop } = useBreakpoint();

  return (
    <View style={[styles.container, isDesktop && { maxWidth }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});
