import React from 'react';
import { View, StyleSheet } from 'react-native';

import { StrategyComparisonCard } from './strategy-comparison-card';
import StrategyPnlBarCard from './strategy-pnl-bar-card';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useContentWidth } from '../../hooks/use-content-width';
import { useStrategyAnalytics } from '../../hooks/use-strategy-analytics';
import { Trade } from '../../types';

type StrategySectionProps = {
  trades: Trade[];
};

export function StrategySection({ trades }: StrategySectionProps) {
  const { strategies } = useStrategyAnalytics(trades);
  const { isDesktop } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles();

  const columnWidth = isDesktop
    ? (contentWidth - COLUMN_GAP) / 2
    : contentWidth;

  const comparisonCard = <StrategyComparisonCard strategies={strategies} />;
  const barCard = (
    <StrategyPnlBarCard strategies={strategies} availableWidth={columnWidth} />
  );

  if (isDesktop) {
    return (
      <View style={styles.masonry}>
        <View style={styles.column}>{comparisonCard}</View>
        <View style={styles.column}>{barCard}</View>
      </View>
    );
  }

  return (
    <>
      {comparisonCard}
      {barCard}
    </>
  );
}

const COLUMN_GAP = 16;
const HALF_GAP = COLUMN_GAP / 2;

const createStyles = () =>
  StyleSheet.create({
    masonry: {
      flexDirection: 'row',
      marginHorizontal: -HALF_GAP,
    },
    column: {
      flex: 1,
      paddingHorizontal: HALF_GAP,
    },
  });
