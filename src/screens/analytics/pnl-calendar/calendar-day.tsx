import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../../../hooks/use-app-theme';
import { DailyPnl } from '../../../hooks/use-daily-pnl';
import { AppTheme } from '../../../theme';
import {
  calculatePnlColor,
  ColorIntensityResult,
} from '../../../utils/color-intensity';

type CalendarDayProps = {
  date: Date;
  isCurrentMonth: boolean;
  dayData: DailyPnl | undefined;
  maxProfit: number;
  maxLoss: number;
  onPress: () => void;
  size: number;
};

export function CalendarDay({
  date,
  isCurrentMonth,
  dayData,
  maxProfit,
  maxLoss,
  onPress,
  size,
}: CalendarDayProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const pnl = dayData?.totalPnl ?? 0;
  const hasTrades = dayData && dayData.tradeCount > 0;

  let colorResult: ColorIntensityResult;
  if (!isCurrentMonth || !hasTrades) {
    colorResult = {
      backgroundColor: 'transparent',
      textColor: 'inherit',
    };
  } else {
    colorResult = calculatePnlColor(
      pnl,
      maxProfit,
      maxLoss,
      theme.colors.profit,
      theme.colors.loss,
      theme.colors.surfaceVariant
    );
  }

  const { backgroundColor, textColor } = colorResult;

  return (
    <TouchableOpacity
      style={[styles.day, { width: size, height: size, backgroundColor }]}
      onPress={onPress}
      disabled={!hasTrades}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.dayText,
          !isCurrentMonth && styles.outsideMonth,
          textColor !== 'inherit' && { color: textColor },
        ]}
      >
        {date.getDate()}
      </Text>
      {hasTrades && (
        <View style={styles.indicator}>
          <Text style={styles.tradeCount}>{dayData.tradeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    day: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
    },
    dayText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    outsideMonth: {
      opacity: 0.3,
    },
    indicator: {
      position: 'absolute',
      bottom: 2,
      right: 4,
    },
    tradeCount: {
      fontSize: 8,
      color: theme.colors.textSecondary,
    },
  });
