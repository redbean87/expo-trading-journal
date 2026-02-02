import React from 'react';

import { OverviewSection } from './overview-section';
import { useTradeAnalytics } from '../../hooks/use-trade-analytics';
import { useTradesInRange } from '../../hooks/use-trades';
import { useAnalyticsStore } from '../../store/analytics-store';
import { getDateRangeStart } from '../../utils/date-range';

export default function OverviewRoute() {
  const { selectedRange } = useAnalyticsStore();
  const startTime = getDateRangeStart(selectedRange);
  const { trades } = useTradesInRange(startTime);

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
}
