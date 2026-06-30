import { Trade } from '../types';

export type TradeAgainOption = 'yes' | 'no' | 'withAdjustment';

export type TradeAgainStats = {
  count: number;
  wins: number;
  losses: number;
  totalPnl: number;
  avgPnl: number;
  winRate: number;
};

export type TradeAgainAnalytics = {
  totalTradesWithResponse: number;
  totalTradesWithoutResponse: number;
  byOption: Record<TradeAgainOption, TradeAgainStats>;
  bestPerformingOption: TradeAgainOption | null;
  worstPerformingOption: TradeAgainOption | null;
  insight: string;
};

const OPTIONS: TradeAgainOption[] = ['yes', 'no', 'withAdjustment'];

function createEmptyStats(): TradeAgainStats {
  return {
    count: 0,
    wins: 0,
    losses: 0,
    totalPnl: 0,
    avgPnl: 0,
    winRate: 0,
  };
}

function labelForOption(option: TradeAgainOption): string {
  switch (option) {
    case 'yes':
      return 'Yes';
    case 'no':
      return 'No';
    case 'withAdjustment':
      return 'With Adjustment';
  }
}

export function calculateTradeAgainAnalytics(
  trades: Trade[]
): TradeAgainAnalytics {
  const tradesWithResponse = trades.filter((t) =>
    OPTIONS.includes(t.wouldTakeTradeAgain as TradeAgainOption)
  );
  const tradesWithoutResponse = trades.filter(
    (t) => !OPTIONS.includes(t.wouldTakeTradeAgain as TradeAgainOption)
  );

  const byOption: TradeAgainAnalytics['byOption'] = {
    yes: createEmptyStats(),
    no: createEmptyStats(),
    withAdjustment: createEmptyStats(),
  };

  for (const trade of tradesWithResponse) {
    const option = trade.wouldTakeTradeAgain as TradeAgainOption;
    const stats = byOption[option];
    stats.count++;
    stats.totalPnl += trade.pnl;
    if (trade.pnl > 0) {
      stats.wins++;
    } else if (trade.pnl < 0) {
      stats.losses++;
    }
  }

  for (const option of OPTIONS) {
    const stats = byOption[option];
    if (stats.count > 0) {
      stats.avgPnl = stats.totalPnl / stats.count;
      stats.winRate = (stats.wins / stats.count) * 100;
    }
  }

  let bestOption: TradeAgainOption | null = null;
  let worstOption: TradeAgainOption | null = null;
  let bestAvgPnl = -Infinity;
  let worstAvgPnl = Infinity;

  for (const option of OPTIONS) {
    const stats = byOption[option];
    if (stats.count >= 2) {
      if (stats.avgPnl > bestAvgPnl) {
        bestAvgPnl = stats.avgPnl;
        bestOption = option;
      }
      if (stats.avgPnl < worstAvgPnl) {
        worstAvgPnl = stats.avgPnl;
        worstOption = option;
      }
    }
  }

  let insight = '';
  if (tradesWithResponse.length === 0) {
    insight =
      "Start recording whether you'd take trades again to see how your post-trade judgment aligns with results.";
  } else if (bestOption !== null && worstOption !== null) {
    const bestLabel = labelForOption(bestOption);
    const worstLabel = labelForOption(worstOption);
    const difference = bestAvgPnl - worstAvgPnl;
    insight = `Trades you'd take again (${bestLabel}) averaged ${formatCurrency(difference)} more profit than those you wouldn't (${worstLabel}). Your gut review is a useful edge signal.`;
  } else {
    insight =
      'Keep marking your trade replay decisions to reveal patterns in your judgment.';
  }

  return {
    totalTradesWithResponse: tradesWithResponse.length,
    totalTradesWithoutResponse: tradesWithoutResponse.length,
    byOption,
    bestPerformingOption: bestOption,
    worstPerformingOption: worstOption,
    insight,
  };
}

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toFixed(2)}`;
}
