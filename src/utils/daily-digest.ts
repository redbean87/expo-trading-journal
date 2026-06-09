import { formatDate } from './date-format';

import type { Trade } from '../types';

export type TradeContext = {
  tradeId: string;
  context: string;
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

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function generateDailyDigestMarkdown(
  trades: Trade[],
  date: Date,
  contexts: TradeContext[],
  timezone?: string
): string {
  const dateLabel = formatDate(date, timezone);

  let markdown = `# Trading Digest — ${dateLabel}\n\n`;

  if (trades.length === 0) {
    markdown += '*No trades for this day.*\n';
    return markdown;
  }

  trades.forEach((trade, index) => {
    const isProfit = trade.pnl >= 0;
    const context = contexts.find((c) => c.tradeId === trade.id)?.context || '';

    markdown += `## ${index + 1}. ${trade.symbol} (${trade.side.toUpperCase()})\n`;
    markdown += `- **Qty:** ${trade.quantity} shares\n`;
    markdown += `- **Entry:** ${formatCurrency(trade.entryPrice)}\n`;
    markdown += `- **Exit:** ${formatCurrency(trade.exitPrice)}\n`;
    markdown += `- **P&L:** ${isProfit ? '+' : ''}${formatCurrency(trade.pnl)} (${formatPercent(trade.pnlPercent)})\n`;
    markdown += `- **Entry Time:** ${formatTime(trade.entryTime, timezone)}\n`;
    markdown += `- **Exit Time:** ${formatTime(trade.exitTime, timezone)}\n`;

    if (trade.fees !== undefined && trade.fees > 0) {
      markdown += `- **Fees:** ${formatCurrency(trade.fees)}\n`;
    }

    if (trade.commissions !== undefined && trade.commissions > 0) {
      markdown += `- **Commissions:** ${formatCurrency(trade.commissions)}\n`;
    }

    if (trade.orderType) {
      markdown += `- **Order Type:** ${trade.orderType}\n`;
    }

    if (trade.riskAmount !== undefined && trade.riskAmount > 0) {
      markdown += `- **Risk Amount:** ${formatCurrency(trade.riskAmount)}\n`;
    }

    if (
      trade.riskAmount !== undefined &&
      trade.riskAmount > 0 &&
      trade.pnl !== undefined
    ) {
      const rMultiple = trade.pnl / trade.riskAmount;
      markdown += `- **R-Multiple:** ${rMultiple.toFixed(2)}R\n`;
    }

    if (trade.accountBalanceAfter !== undefined) {
      markdown += `- **Balance After:** ${formatCurrency(trade.accountBalanceAfter)}\n`;
    }

    if (context.trim()) {
      markdown += `- **My Context:** ${context.trim()}\n`;
    }

    markdown += '\n';
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
