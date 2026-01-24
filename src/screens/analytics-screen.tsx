import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

import { LoadingState } from '../components/loading-state';
import { useAppTheme } from '../hooks/use-app-theme';
import { useEquityCurve } from '../hooks/use-equity-curve';
import { useTradeAnalytics } from '../hooks/use-trade-analytics';
import { useTradesInRange } from '../hooks/use-trades';
import { AnalyticsSegment } from '../types';
import { DateRangePreset, getDateRangeStart } from '../utils/date-range';
import { ChartsSection } from './analytics/charts-section';
import { DateRangeFilter } from './analytics/date-range-filter';
import { OverviewSection } from './analytics/overview-section';
import { PsychologySection } from './analytics/psychology-section';
import { TimingSection } from './analytics/timing-section';

export default function AnalyticsScreen() {
  const theme = useAppTheme();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DateRangePreset>('all');
  const [selectedSegment, setSelectedSegment] =
    useState<AnalyticsSegment>('overview');

  const startTime = getDateRangeStart(selectedRange);
  const { trades, isLoading } = useTradesInRange(startTime);

  const {
    totalTrades,
    winningTrades,
    losingTrades,
    breakEvenTrades,
    totalPnl,
    avgWin,
    avgLoss,
    avgTradePnl,
    avgPerShareWin,
    avgPerShareLoss,
    largestGain,
    largestLoss,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    avgHoldTimeMs,
    winRate,
    profitFactor,
    bestTrade,
    worstTrade,
    longTrades,
    shortTrades,
    longPnl,
    shortPnl,
    realizedRR,
    expectedValue,
    requiredWinRate,
    longWinRate,
    longRR,
    shortWinRate,
    shortRR,
  } = useTradeAnalytics(trades);
  const equityCurveData = useEquityCurve(trades);

  const styles = createStyles(theme);

  const renderSection = () => {
    switch (selectedSegment) {
      case 'overview':
        return (
          <OverviewSection
            totalTrades={totalTrades}
            winRate={winRate}
            totalPnl={totalPnl}
            avgTradePnl={avgTradePnl}
            profitFactor={profitFactor}
            winningTradesCount={winningTrades.length}
            losingTradesCount={losingTrades.length}
            breakEvenTradesCount={breakEvenTrades.length}
            avgWin={avgWin}
            avgLoss={avgLoss}
            avgPerShareWin={avgPerShareWin}
            avgPerShareLoss={avgPerShareLoss}
            largestGain={largestGain}
            largestLoss={largestLoss}
            avgHoldTimeMs={avgHoldTimeMs}
            maxConsecutiveWins={maxConsecutiveWins}
            maxConsecutiveLosses={maxConsecutiveLosses}
            longTradesCount={longTrades.length}
            shortTradesCount={shortTrades.length}
            longPnl={longPnl}
            shortPnl={shortPnl}
            realizedRR={realizedRR}
            expectedValue={expectedValue}
            requiredWinRate={requiredWinRate}
            longRR={longRR}
            shortRR={shortRR}
            longWinRate={longWinRate}
            shortWinRate={shortWinRate}
            bestTrade={bestTrade}
            worstTrade={worstTrade}
          />
        );
      case 'timing':
        return <TimingSection trades={trades} />;
      case 'charts':
        return (
          <ChartsSection
            equityCurveData={equityCurveData}
            onInteractionStart={() => setScrollEnabled(false)}
            onInteractionEnd={() => setScrollEnabled(true)}
          />
        );
      case 'psychology':
        return <PsychologySection trades={trades} />;
    }
  };

  return (
    <LoadingState isLoading={isLoading}>
      <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
        <View style={styles.content}>
          <DateRangeFilter
            selectedRange={selectedRange}
            onSelectRange={setSelectedRange}
          />

          <SegmentedButtons
            value={selectedSegment}
            onValueChange={(value) =>
              setSelectedSegment(value as AnalyticsSegment)
            }
            buttons={[
              { value: 'overview', label: 'Overview' },
              { value: 'timing', label: 'Timing' },
              { value: 'charts', label: 'Charts' },
              { value: 'psychology', label: 'Psych' },
            ]}
            style={styles.segmentToggle}
          />

          {renderSection()}
        </View>
      </ScrollView>
    </LoadingState>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    segmentToggle: {
      marginBottom: 16,
    },
  });
