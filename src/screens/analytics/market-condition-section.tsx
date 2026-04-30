import React from 'react';
import { View, StyleSheet } from 'react-native';

import { MarketConditionComparisonCard } from './market-condition-comparison-card';
import MarketConditionPnlBarCard from './market-condition-pnl-bar-card';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useContentWidth } from '../../hooks/use-content-width';
import { useMarketConditionAnalytics } from '../../hooks/use-market-condition-analytics';
import { Trade } from '../../types';

type MarketConditionSectionProps = {
  trades: Trade[];
};

export function MarketConditionSection({
  trades,
}: MarketConditionSectionProps) {
  const { conditions } = useMarketConditionAnalytics(trades);
  const { isDesktop } = useBreakpoint();
  const contentWidth = useContentWidth();
  const styles = createStyles();

  const columnWidth = isDesktop
    ? (contentWidth - COLUMN_GAP) / 2
    : contentWidth;

  const comparisonCard = (
    <MarketConditionComparisonCard conditions={conditions} />
  );
  const barCard = (
    <MarketConditionPnlBarCard
      conditions={conditions}
      availableWidth={columnWidth}
    />
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
