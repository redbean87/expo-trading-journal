import { Trade } from '../types';

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

export type ConfidenceAnalytics = {
  totalTradesWithConfidence: number;
  totalTradesWithoutConfidence: number;
  byLevel: Record<
    ConfidenceLevel,
    {
      count: number;
      wins: number;
      losses: number;
      totalPnl: number;
      avgPnl: number;
      winRate: number;
    }
  >;
  bestPerformingLevel: ConfidenceLevel | null;
  worstPerformingLevel: ConfidenceLevel | null;
  overconfidenceDetected: boolean;
  insight: string;
};

export function calculateConfidenceAnalytics(
  trades: Trade[]
): ConfidenceAnalytics {
  const tradesWithConfidence = trades.filter((t) => t.confidence !== undefined);
  const tradesWithoutConfidence = trades.filter(
    (t) => t.confidence === undefined
  );

  const byLevel: ConfidenceAnalytics['byLevel'] = {
    1: { count: 0, wins: 0, losses: 0, totalPnl: 0, avgPnl: 0, winRate: 0 },
    2: { count: 0, wins: 0, losses: 0, totalPnl: 0, avgPnl: 0, winRate: 0 },
    3: { count: 0, wins: 0, losses: 0, totalPnl: 0, avgPnl: 0, winRate: 0 },
    4: { count: 0, wins: 0, losses: 0, totalPnl: 0, avgPnl: 0, winRate: 0 },
    5: { count: 0, wins: 0, losses: 0, totalPnl: 0, avgPnl: 0, winRate: 0 },
  };

  // Aggregate data by confidence level
  for (const trade of tradesWithConfidence) {
    const level = trade.confidence as ConfidenceLevel;
    if (level >= 1 && level <= 5) {
      const stats = byLevel[level];
      stats.count++;
      stats.totalPnl += trade.pnl;
      if (trade.pnl > 0) {
        stats.wins++;
      } else if (trade.pnl < 0) {
        stats.losses++;
      }
    }
  }

  // Calculate averages and win rates
  for (let level = 1; level <= 5; level++) {
    const stats = byLevel[level as ConfidenceLevel];
    if (stats.count > 0) {
      stats.avgPnl = stats.totalPnl / stats.count;
      stats.winRate = (stats.wins / stats.count) * 100;
    }
  }

  // Find best and worst performing levels (by avg P&L, min 3 trades)
  let bestLevel: ConfidenceLevel | null = null;
  let worstLevel: ConfidenceLevel | null = null;
  let bestAvgPnl = -Infinity;
  let worstAvgPnl = Infinity;

  for (let level = 1; level <= 5; level++) {
    const stats = byLevel[level as ConfidenceLevel];
    if (stats.count >= 3) {
      if (stats.avgPnl > bestAvgPnl) {
        bestAvgPnl = stats.avgPnl;
        bestLevel = level as ConfidenceLevel;
      }
      if (stats.avgPnl < worstAvgPnl) {
        worstAvgPnl = stats.avgPnl;
        worstLevel = level as ConfidenceLevel;
      }
    }
  }

  // Detect overconfidence: high confidence (4-5) but poor performance
  const highConfidenceTrades = byLevel[4].count + byLevel[5].count;
  const highConfidenceWins = byLevel[4].wins + byLevel[5].wins;
  const highConfidenceLosses = byLevel[4].losses + byLevel[5].losses;
  const highConfidenceWinRate =
    highConfidenceTrades > 0
      ? (highConfidenceWins / (highConfidenceWins + highConfidenceLosses)) * 100
      : 0;

  const midConfidenceWinRate = byLevel[3].count > 0 ? byLevel[3].winRate : 0;

  const overconfidenceDetected =
    highConfidenceTrades >= 5 &&
    highConfidenceWinRate < midConfidenceWinRate - 10;

  // Generate insight
  let insight = '';
  if (tradesWithConfidence.length === 0) {
    insight =
      'Start recording confidence levels to see how your self-assessment correlates with performance.';
  } else if (bestLevel !== null && worstLevel !== null) {
    if (bestLevel > worstLevel) {
      insight = `You perform best at confidence level ${bestLevel}. Higher confidence correlates with better results.`;
    } else if (bestLevel < worstLevel) {
      insight = `You perform best at confidence level ${bestLevel}. Lower confidence correlates with better results - you might be overthinking high-confidence setups.`;
    } else {
      insight = `Confidence level ${bestLevel} shows your best performance. Consider what makes those trades different.`;
    }
  } else {
    insight =
      'Keep tracking confidence to identify your optimal confidence zone.';
  }

  if (overconfidenceDetected) {
    insight +=
      ' Warning: High confidence (4-5) setups are underperforming. Consider being more selective.';
  }

  return {
    totalTradesWithConfidence: tradesWithConfidence.length,
    totalTradesWithoutConfidence: tradesWithoutConfidence.length,
    byLevel,
    bestPerformingLevel: bestLevel,
    worstPerformingLevel: worstLevel,
    overconfidenceDetected,
    insight,
  };
}
