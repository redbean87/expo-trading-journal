import React, { useState, useCallback } from 'react';
import { View, ViewStyle } from 'react-native';
import { ResponsiveContainer } from 'recharts';

type ChartContainerProps = {
  children: React.ReactElement;
  height: number;
  style?: ViewStyle;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onTouchCancel?: () => void;
};

export function ChartContainer({
  children,
  height,
  style,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: ChartContainerProps) {
  const [isReady, setIsReady] = useState(false);

  const handleLayout = useCallback(() => {
    if (!isReady) {
      setIsReady(true);
    }
  }, [isReady]);

  return (
    <View
      style={[{ height }, style]}
      onLayout={handleLayout}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      {isReady && (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </View>
  );
}
