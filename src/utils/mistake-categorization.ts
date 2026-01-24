import {
  MISTAKE_CATEGORIES,
  MistakeCategoryId,
  getMistakeCategoryLabel,
} from '../constants/mistake-categories';
import { Trade } from '../types';

export type MistakeSummary = {
  categoryId: MistakeCategoryId;
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

export function categorizeMistake(
  ruleViolation: string | undefined
): MistakeCategoryId | null {
  if (!ruleViolation || ruleViolation.trim() === '') {
    return null;
  }

  const normalized = ruleViolation.toLowerCase().trim();

  for (const category of MISTAKE_CATEGORIES) {
    if (category.id === 'other') continue;

    for (const keyword of category.keywords) {
      if (normalized.includes(keyword)) {
        return category.id;
      }
    }
  }

  return 'other';
}

export function calculateMistakeAnalytics(trades: Trade[]): MistakeAnalytics {
  const tradesWithMistakes: Trade[] = [];
  const tradesWithoutMistakes: Trade[] = [];
  const mistakeMap = new Map<MistakeCategoryId, Trade[]>();

  for (const trade of trades) {
    const categoryId = categorizeMistake(trade.ruleViolation);

    if (categoryId === null) {
      tradesWithoutMistakes.push(trade);
    } else {
      tradesWithMistakes.push(trade);
      const existing = mistakeMap.get(categoryId) ?? [];
      existing.push(trade);
      mistakeMap.set(categoryId, existing);
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

  for (const [categoryId, categoryTrades] of mistakeMap.entries()) {
    const totalPnl = categoryTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winningTrades = categoryTrades.filter((t) => t.pnl > 0);
    const winRate =
      categoryTrades.length > 0
        ? (winningTrades.length / categoryTrades.length) * 100
        : 0;

    mistakesByCategory.push({
      categoryId,
      label: getMistakeCategoryLabel(categoryId),
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
