import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../../../hooks/use-app-theme';
import { DailyPnl } from '../../../hooks/use-daily-pnl';
import { AppTheme } from '../../../theme';
import {
  calculatePnlColor,
  ColorIntensityResult,
} from '../../../utils/color-intensity';
import { formatCompactPnl } from '../../../utils/format-pnl';

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
  const styles = createStyles(theme, size);

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
          styles.dayNumber,
          !isCurrentMonth && styles.outsideMonth,
          textColor !== 'inherit' && { color: textColor },
        ]}
      >
        {date.getDate()}
      </Text>
      {hasTrades && (
        <>
          <Text style={styles.pnlText}>{formatCompactPnl(pnl)}</Text>
          <Text style={styles.winLossText}>
            {dayData.winCount}W · {dayData.lossCount}L
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: AppTheme, size: number) =>
  StyleSheet.create({
    day: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      padding: 2,
    },
    dayNumber: {
      position: 'absolute',
      top: 2,
      right: 4,
      fontSize: size > 50 ? 12 : 10,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    outsideMonth: {
      opacity: 0.3,
    },
    pnlText: {
      fontSize: size > 50 ? 12 : 10,
      fontWeight: '700',
      color: '#ffffff',
      marginTop: 4,
    },
    winLossText: {
      position: 'absolute',
      bottom: 2,
      fontSize: size > 50 ? 10 : 8,
      fontWeight: '500',
      color: '#ffffff',
      opacity: 0.9,
    },
  });
