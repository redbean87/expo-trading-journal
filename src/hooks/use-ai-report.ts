import { useMemo } from 'react';

import { useDayOfWeekBreakdown } from './use-day-of-week-breakdown';
import { useEquityCurve } from './use-equity-curve';
import {
  useHoldTimeHistogram,
  type HoldTimeBin,
} from './use-hold-time-histogram';
import { useMistakeAnalytics } from './use-mistake-analytics';
import { useStrategyAnalytics } from './use-strategy-analytics';
import {
  useTimeOfDayBreakdown,
  type TimeOfDaySummary,
} from './use-time-of-day-breakdown';
import { useTradeAgainAnalytics } from './use-trade-again-analytics';
import { useTradeAnalytics } from './use-trade-analytics';

import type { Trade } from '../types';
import type {
  AIReportData,
  AIReportTrade,
  AIReportStatistics,
  AIReportEquityData,
  AIReportMistakeData,
  AIReportTimeOfDayData,
  AIReportDayOfWeekData,
  AIReportStrategyData,
  AIReportHoldTimeData,
  AIReportTradeAgainData,
} from '../types/ai-report';

function selectTradesForReport(
  trades: Trade[],
  includeIndividual: boolean,
  tradeDateLimit: number | null,
  periodEnd: Date
): Trade[] {
  if (!includeIndividual) return [];

  let filtered = trades;
  if (tradeDateLimit !== null) {
    const cutoff = new Date(periodEnd);
    cutoff.setDate(cutoff.getDate() - tradeDateLimit);
    filtered = trades.filter((t) => t.exitTime >= cutoff);
  }

  // Sort by recency (most recent first) and return
  return filtered.sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime());
}

export function useAIReport(
  trades: Trade[],
  periodLabel: string,
  periodStart: Date,
  periodEnd: Date,
  options: {
    tradeDateLimit: number | null;
    includeIndividualTrades: boolean;
  } = {
    tradeDateLimit: null,
    includeIndividualTrades: false,
  }
): AIReportData | null {
  const analytics = useTradeAnalytics(trades);
  const equity = useEquityCurve(trades);
  const mistakes = useMistakeAnalytics(trades);
  const tradeAgain = useTradeAgainAnalytics(trades);
  const timeOfDay = useTimeOfDayBreakdown(trades);
  const dayOfWeek = useDayOfWeekBreakdown(trades);
  const strategies = useStrategyAnalytics(trades);
  const holdTime = useHoldTimeHistogram(trades);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    if (trades.length === 0) {
      return null;
    }

    // Calculate long/short stats
    const longWinRate =
      analytics.longTrades.length > 0
        ? analytics.longTrades.filter((t) => t.pnl > 0).length /
          analytics.longTrades.length
        : 0;
    const shortWinRate =
      analytics.shortTrades.length > 0
        ? analytics.shortTrades.filter((t) => t.pnl > 0).length /
          analytics.shortTrades.length
        : 0;

    // Build statistics
    const statistics: AIReportStatistics = {
      totalTrades: analytics.totalTrades,
      winningTrades: analytics.winningTrades.length,
      losingTrades: analytics.losingTrades.length,
      breakEvenTrades: analytics.breakEvenTrades.length,
      winRate: analytics.winRate,
      totalPnl: analytics.totalPnl,
      averageDailyPnl: analytics.avgDailyPnl,
      averageTradePnl: analytics.avgTradePnl,
      pnlStdDev: analytics.pnlStdDev,
      totalFees: analytics.totalFees + analytics.totalCommissions,
      averageWin: analytics.avgWin,
      averageLoss: analytics.avgLoss,
      largestGain: analytics.largestGain,
      largestLoss: analytics.largestLoss,
      maxConsecutiveWins: analytics.maxConsecutiveWins,
      maxConsecutiveLosses: analytics.maxConsecutiveLosses,
      profitFactor: analytics.profitFactor,
      expectancy: analytics.expectedValue,
      realizedRR: analytics.realizedRR,
      requiredWinRate: analytics.requiredWinRate,
      longTrades: {
        count: analytics.longTrades.length,
        winRate: longWinRate,
        totalPnl: analytics.longPnl,
      },
      shortTrades: {
        count: analytics.shortTrades.length,
        winRate: shortWinRate,
        totalPnl: analytics.shortPnl,
      },
    };

    // Build equity data
    const equityData: AIReportEquityData = {
      startingBalance: equity.startingBalance,
      currentBalance: equity.currentBalance,
      totalReturnPercent: equity.totalReturnPercent,
      maxDrawdown: equity.maxDrawdown,
      maxDrawdownPercent: equity.maxDrawdownPercent,
      peakValue: equity.peakValue,
      tradingDays: equity.tradingDays,
      bestDay: equity.bestDay,
      worstDay: equity.worstDay,
      longestRecovery: equity.longestRecovery,
      avgRecovery: equity.avgRecovery,
      totalDaysInDrawdown: equity.totalDaysInDrawdown,
    };

    // Build mistake data
    const topMistakesByFrequency = mistakes.mistakesByCategory
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((mistake) => ({
        type: mistake.label,
        count: mistake.count,
        cost: Math.abs(mistake.totalPnl),
      }));

    const costliestMistake = mistakes.costliestMistake
      ? {
          type: mistakes.costliestMistake.label,
          cost: Math.abs(mistakes.costliestMistake.totalPnl),
        }
      : null;

    const mistakeData: AIReportMistakeData = {
      tradesWithMistakes: mistakes.totalTradesWithMistakes,
      tradesWithMistakesPnl: mistakes.pnlWithMistakes,
      tradesWithoutMistakes: mistakes.totalTradesWithoutMistakes,
      tradesWithoutMistakesPnl: mistakes.pnlWithoutMistakes,
      ruleViolations: trades.filter(
        (t) => t.ruleViolation && t.ruleViolation.trim() !== ''
      ).length,
      topMistakesByFrequency,
      costliestMistake,
    };

    // Build timing data
    const timeOfDayData: AIReportTimeOfDayData = timeOfDay.map(
      (h: TimeOfDaySummary) => ({
        hour: h.hour,
        tradeCount: h.tradeCount,
        winRate: h.winRate,
        totalPnl: h.totalPnl,
      })
    );

    const dayOfWeekData: AIReportDayOfWeekData = [
      {
        day: 'Monday',
        tradeCount: dayOfWeek[0]?.tradeCount ?? 0,
        winRate: dayOfWeek[0]?.winRate ?? 0,
        totalPnl: dayOfWeek[0]?.totalPnl ?? 0,
      },
      {
        day: 'Tuesday',
        tradeCount: dayOfWeek[1]?.tradeCount ?? 0,
        winRate: dayOfWeek[1]?.winRate ?? 0,
        totalPnl: dayOfWeek[1]?.totalPnl ?? 0,
      },
      {
        day: 'Wednesday',
        tradeCount: dayOfWeek[2]?.tradeCount ?? 0,
        winRate: dayOfWeek[2]?.winRate ?? 0,
        totalPnl: dayOfWeek[2]?.totalPnl ?? 0,
      },
      {
        day: 'Thursday',
        tradeCount: dayOfWeek[3]?.tradeCount ?? 0,
        winRate: dayOfWeek[3]?.winRate ?? 0,
        totalPnl: dayOfWeek[3]?.totalPnl ?? 0,
      },
      {
        day: 'Friday',
        tradeCount: dayOfWeek[4]?.tradeCount ?? 0,
        winRate: dayOfWeek[4]?.winRate ?? 0,
        totalPnl: dayOfWeek[4]?.totalPnl ?? 0,
      },
      {
        day: 'Saturday',
        tradeCount: dayOfWeek[5]?.tradeCount ?? 0,
        winRate: dayOfWeek[5]?.winRate ?? 0,
        totalPnl: dayOfWeek[5]?.totalPnl ?? 0,
      },
      {
        day: 'Sunday',
        tradeCount: dayOfWeek[6]?.tradeCount ?? 0,
        winRate: dayOfWeek[6]?.winRate ?? 0,
        totalPnl: dayOfWeek[6]?.totalPnl ?? 0,
      },
    ];

    // Build strategy data
    const strategyData: AIReportStrategyData = strategies.strategies.map(
      (s) => ({
        strategy: s.name,
        tradeCount: s.tradeCount,
        winRate: s.winRate,
        totalPnl: s.totalPnl,
        averagePnl: s.avgPnl,
        profitFactor: s.profitFactor,
      })
    );

    // Build hold time data
    const holdTimeData: AIReportHoldTimeData = holdTime.map(
      (bin: HoldTimeBin) => ({
        bucket: bin.label,
        tradeCount: bin.count,
        averagePnl: bin.avgPnl,
      })
    );

    // Build trade again data
    const tradeAgainData: AIReportTradeAgainData = {
      yes: {
        count: tradeAgain.byOption.yes.count,
        winRate: tradeAgain.byOption.yes.winRate / 100,
        totalPnl: tradeAgain.byOption.yes.totalPnl,
        averagePnl: tradeAgain.byOption.yes.avgPnl,
      },
      no: {
        count: tradeAgain.byOption.no.count,
        winRate: tradeAgain.byOption.no.winRate / 100,
        totalPnl: tradeAgain.byOption.no.totalPnl,
        averagePnl: tradeAgain.byOption.no.avgPnl,
      },
      withAdjustment: {
        count: tradeAgain.byOption.withAdjustment.count,
        winRate: tradeAgain.byOption.withAdjustment.winRate / 100,
        totalPnl: tradeAgain.byOption.withAdjustment.totalPnl,
        averagePnl: tradeAgain.byOption.withAdjustment.avgPnl,
      },
      insight: tradeAgain.insight,
    };

    // Select trades for report
    const selectedTrades: AIReportTrade[] = selectTradesForReport(
      trades,
      options.includeIndividualTrades,
      options.tradeDateLimit,
      periodEnd
    );

    return {
      period: {
        startDate: periodStart,
        endDate: periodEnd,
        label: periodLabel,
      },
      statistics,
      equity: equityData,
      mistakes: mistakeData,
      timeOfDay: timeOfDayData,
      dayOfWeek: dayOfWeekData,
      strategies: strategyData,
      holdTime: holdTimeData,
      tradeAgain: tradeAgainData,
      selectedTrades,
      options: {
        tradeDateLimit: options.tradeDateLimit,
        includeIndividualTrades: options.includeIndividualTrades,
      },
    };
  }, [
    trades,
    analytics,
    equity,
    mistakes,
    tradeAgain,
    timeOfDay,
    dayOfWeek,
    strategies,
    holdTime,
    periodLabel,
    periodStart,
    periodEnd,
    options,
  ]);
}
