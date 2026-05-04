import React from 'react';
import { View, StyleSheet } from 'react-native';

import { HtfContextComparisonCard } from './htf-context-comparison-card';
import HtfContextPnlBarCard from './htf-context-pnl-bar-card';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useContentWidth } from '../../hooks/use-content-width';
import { useHtfContextAnalytics } from '../../hooks/use-htf-context-analytics';
import { Trade } from '../../types';

type HtfContextSectionProps = {
  trades: Trade[];
};

export function HtfContextSection({ trades }: HtfContextSectionProps) {
  const { contexts } = useHtfContextAnalytics(trades);
  const { isDesktop } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles();

  const columnWidth = isDesktop
    ? (contentWidth - COLUMN_GAP) / 2
    : contentWidth;

  const comparisonCard = <HtfContextComparisonCard contexts={contexts} />;
  const barCard = (
    <HtfContextPnlBarCard contexts={contexts} availableWidth={columnWidth} />
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
