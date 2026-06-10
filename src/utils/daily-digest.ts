import { formatDate } from './date-format';

import type { Trade } from '../types';

export type TradeContext = {
  tradeId: string;
  // Simple mode
  context?: string;
  // Structured mode
  setup?: string;
  trigger?: string;
  support?: string;
  target?: string;
  // Custom text for chip selections
  setupCustom?: string;
  supportCustom?: string;
};

function formatTime(date: Date, timezone?: string): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  });
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function calculateRMultiple(trade: Trade): number | null {
  if (
    trade.riskAmount !== undefined &&
    trade.riskAmount > 0 &&
    trade.pnl !== undefined
  ) {
    return trade.pnl / trade.riskAmount;
  }
  return null;
}

function generateDailySummary(trades: Trade[]): string {
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.pnl > 0).length;
  const losses = trades.filter((t) => t.pnl < 0).length;
  const winRate =
    totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : '0';
  const netPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const grossWinners = trades
    .filter((t) => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);
  const grossLosers = trades
    .filter((t) => t.pnl < 0)
    .reduce((sum, t) => sum + t.pnl, 0);
  const rMultiples = trades
    .map(calculateRMultiple)
    .filter((r): r is number => r !== null);
  const totalR = rMultiples.reduce((sum, r) => sum + r, 0);
  const avgR = rMultiples.length > 0 ? totalR / rMultiples.length : 0;

  let bestTrade = '';
  let worstTrade = '';
  if (trades.length > 0) {
    const best = trades.reduce((best, current) => {
      const bestR = calculateRMultiple(best);
      const currentR = calculateRMultiple(current);
      if (bestR === null) return current;
      if (currentR === null) return best;
      return currentR > bestR ? current : best;
    });
    const worst = trades.reduce((worst, current) => {
      const worstR = calculateRMultiple(worst);
      const currentR = calculateRMultiple(current);
      if (worstR === null) return current;
      if (currentR === null) return worst;
      return currentR < worstR ? current : worst;
    });
    const bestR = calculateRMultiple(best);
    const worstR = calculateRMultiple(worst);
    if (bestR !== null) {
      bestTrade = `${best.symbol} ${bestR >= 0 ? '+' : ''}${bestR.toFixed(2)}R`;
    }
    if (worstR !== null) {
      worstTrade = `${worst.symbol} ${worstR >= 0 ? '+' : ''}${worstR.toFixed(2)}R`;
    }
  }

  let summary = `## Daily Summary\n\n`;
  summary += `Trades: ${totalTrades}\n`;
  summary += `Wins: ${wins}\n`;
  summary += `Losses: ${losses}\n`;
  summary += `Win Rate: ${winRate}%\n\n`;
  summary += `Net P&L: ${netPnl >= 0 ? '+' : ''}${formatCurrency(netPnl)}\n\n`;
  summary += `Gross Winners: +${formatCurrency(grossWinners)}\n`;
  summary += `Gross Losers: ${formatCurrency(grossLosers)}\n\n`;
  if (rMultiples.length > 0) {
    summary += `Total R: ${totalR >= 0 ? '+' : ''}${totalR.toFixed(2)}R\n`;
    summary += `Average R: ${avgR >= 0 ? '+' : ''}${avgR.toFixed(2)}R\n\n`;
    if (bestTrade) {
      summary += `Best Trade: ${bestTrade}\n`;
    }
    if (worstTrade) {
      summary += `Worst Trade: ${worstTrade}\n`;
    }
  }
  summary += `\n---\n\n`;

  return summary;
}

export function generateDailyDigestMarkdown(
  trades: Trade[],
  date: Date,
  contexts: TradeContext[],
  mode: 'simple' | 'structured',
  timezone?: string
): string {
  const dateLabel = formatDate(date, timezone);

  let markdown = `# Trading Digest — ${dateLabel}\n\n`;

  if (trades.length === 0) {
    markdown += '*No trades for this day.*\n';
    return markdown;
  }

  // Sort trades by entry time ascending (oldest first)
  const sortedTrades = [...trades].sort(
    (a, b) => a.entryTime.getTime() - b.entryTime.getTime()
  );

  markdown += generateDailySummary(sortedTrades);

  sortedTrades.forEach((trade, index) => {
    const isProfit = trade.pnl >= 0;
    const tradeContext = contexts.find((c) => c.tradeId === trade.id);
    const rMultiple = calculateRMultiple(trade);
    const screenshot = generateScreenshotFilename(trade);

    markdown += `## Trade ${index + 1} — ${trade.symbol}\n\n`;
    markdown += `Screenshot: ${screenshot}\n\n`;
    markdown += `Time: ${formatTime(trade.entryTime, timezone)}\n`;
    markdown += `Qty: ${trade.quantity} shares\n`;
    markdown += `Entry: ${formatCurrency(trade.entryPrice)}\n`;
    markdown += `Exit: ${formatCurrency(trade.exitPrice)}\n\n`;

    if (trade.riskAmount !== undefined && trade.riskAmount > 0) {
      markdown += `Risk: ${formatCurrency(trade.riskAmount)}\n`;
    }

    markdown += `P&L: ${isProfit ? '+' : ''}${formatCurrency(trade.pnl)}\n`;
    if (rMultiple !== null) {
      markdown += `R: ${rMultiple >= 0 ? '+' : ''}${rMultiple.toFixed(2)}R\n`;
    }

    // Context section
    if (mode === 'structured') {
      const setup =
        tradeContext?.setup === 'Custom' && tradeContext?.setupCustom
          ? tradeContext.setupCustom
          : tradeContext?.setup;
      const support =
        tradeContext?.support === 'Custom' && tradeContext?.supportCustom
          ? tradeContext.supportCustom
          : tradeContext?.support;

      if (setup || tradeContext?.trigger || support || tradeContext?.target) {
        markdown += `\n`;
        if (setup) markdown += `Setup: ${setup}\n`;
        if (tradeContext?.trigger)
          markdown += `Trigger: ${tradeContext.trigger}\n`;
        if (support) markdown += `Support: ${support}\n`;
        if (tradeContext?.target)
          markdown += `Target: ${tradeContext.target}\n`;
        markdown += `Side: ${trade.side.toUpperCase()}\n`;
      }
    } else if (tradeContext?.context?.trim()) {
      markdown += `\nContext:\n${tradeContext.context.trim()}\n`;
    }

    markdown += `\n---\n\n`;
  });

  return markdown.trim();
}

export function getTradesForDate(trades: Trade[], date: Date): Trade[] {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth();
  const targetDay = date.getDate();

  return trades.filter((trade) => {
    const tradeDate = trade.entryTime;
    return (
      tradeDate.getFullYear() === targetYear &&
      tradeDate.getMonth() === targetMonth &&
      tradeDate.getDate() === targetDay
    );
  });
}

export function generateScreenshotFilename(trade: Trade): string {
  const date = trade.entryTime;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}-${trade.symbol.toUpperCase()}.png`;
}
