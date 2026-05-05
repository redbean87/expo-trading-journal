import { Trade } from '../types';

export type MistakeSummary = {
  label: string;
  count: number;
  trades: Trade[];
  totalPnl: number;
  avgPnl: number;
  winRate: number;
};

export type MistakeAnalytics = {
  totalTradesWithMistakes: number;
  totalTradesWithoutMistakes: number;
  mistakesByCategory: MistakeSummary[];
  pnlWithMistakes: number;
  pnlWithoutMistakes: number;
  avgPnlWithMistakes: number;
  avgPnlWithoutMistakes: number;
  topMistake: MistakeSummary | null;
  costliestMistake: MistakeSummary | null;
};

export function calculateMistakeAnalytics(trades: Trade[]): MistakeAnalytics {
  const tradesWithMistakes: Trade[] = [];
  const tradesWithoutMistakes: Trade[] = [];
  const mistakeMap = new Map<string, Trade[]>();

  for (const trade of trades) {
    if (!trade.ruleViolation || trade.ruleViolation.trim() === '') {
      tradesWithoutMistakes.push(trade);
    } else {
      tradesWithMistakes.push(trade);
      const existing = mistakeMap.get(trade.ruleViolation) ?? [];
      existing.push(trade);
      mistakeMap.set(trade.ruleViolation, existing);
    }
  }

  const pnlWithMistakes = tradesWithMistakes.reduce((sum, t) => sum + t.pnl, 0);
  const pnlWithoutMistakes = tradesWithoutMistakes.reduce(
    (sum, t) => sum + t.pnl,
    0
  );

  const avgPnlWithMistakes =
    tradesWithMistakes.length > 0
      ? pnlWithMistakes / tradesWithMistakes.length
      : 0;
  const avgPnlWithoutMistakes =
    tradesWithoutMistakes.length > 0
      ? pnlWithoutMistakes / tradesWithoutMistakes.length
      : 0;

  const mistakesByCategory: MistakeSummary[] = [];

  for (const [label, categoryTrades] of mistakeMap.entries()) {
    const totalPnl = categoryTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winningTrades = categoryTrades.filter((t) => t.pnl > 0);
    const winRate =
      categoryTrades.length > 0
        ? (winningTrades.length / categoryTrades.length) * 100
        : 0;

    mistakesByCategory.push({
      label,
      count: categoryTrades.length,
      trades: categoryTrades,
      totalPnl,
      avgPnl: totalPnl / categoryTrades.length,
      winRate,
    });
  }

  mistakesByCategory.sort((a, b) => b.count - a.count);

  const topMistake =
    mistakesByCategory.length > 0 ? mistakesByCategory[0] : null;

  const costliestMistake =
    mistakesByCategory.length > 0
      ? [...mistakesByCategory].sort((a, b) => a.totalPnl - b.totalPnl)[0]
      : null;

  return {
    totalTradesWithMistakes: tradesWithMistakes.length,
    totalTradesWithoutMistakes: tradesWithoutMistakes.length,
    mistakesByCategory,
    pnlWithMistakes,
    pnlWithoutMistakes,
    avgPnlWithMistakes,
    avgPnlWithoutMistakes,
    topMistake,
    costliestMistake,
  };
}
