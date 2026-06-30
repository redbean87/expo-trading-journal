import { formatCurrency } from './format-pnl';

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

/**
 * Format a trade for AI analysis
 */
function formatTrade(trade: AIReportTrade, index: number): string {
  const violation = trade.ruleViolation ? ' | ⚠️ Violation' : '';
  const psychology = trade.psychology ? ' | 🧠 Notes' : '';

  return `**Trade ${index + 1}:** ${trade.symbol} ${trade.side === 'long' ? 'Long' : 'Short'} ${formatCurrency(trade.pnl)} | ${trade.exitTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} | SQ:${trade.setupQuality || 'N/A'}${violation}${psychology}`;
}

/**
 * Format performance summary section
 */
function formatPerformanceSummary(stats: AIReportStatistics): string {
  const lines: string[] = [
    '## Performance Summary',
    '',
    '**Overall Stats:**',
    `- Total Trades: ${stats.totalTrades} | Win Rate: ${stats.winRate.toFixed(1)}%`,
    `- Total P&L: ${formatCurrency(stats.totalPnl)} | Profit Factor: ${stats.profitFactor.toFixed(2)}`,
    `- Expectancy: ${formatCurrency(stats.expectancy)} per trade`,
    `- Avg Win: ${formatCurrency(stats.averageWin)} | Avg Loss: ${formatCurrency(stats.averageLoss)}`,
    `- Largest Gain: ${formatCurrency(stats.largestGain)} | Largest Loss: ${formatCurrency(stats.largestLoss)}`,
    `- Longest Win Streak: ${stats.maxConsecutiveWins} | Longest Loss Streak: ${stats.maxConsecutiveLosses}`,
    '',
    '**By Side:**',
    `- Long Trades: ${stats.longTrades.count} (${((stats.longTrades.count / stats.totalTrades) * 100).toFixed(0)}%) | Win Rate: ${stats.longTrades.winRate.toFixed(1)}% | P&L: ${formatCurrency(stats.longTrades.totalPnl)}`,
    `- Short Trades: ${stats.shortTrades.count} (${((stats.shortTrades.count / stats.totalTrades) * 100).toFixed(0)}%) | Win Rate: ${stats.shortTrades.winRate.toFixed(1)}% | P&L: ${formatCurrency(stats.shortTrades.totalPnl)}`,
    '',
    `**Risk Metrics:**`,
    `- Realized R:R Ratio: ${stats.realizedRR.toFixed(2)}`,
    `- Required Win Rate: ${stats.requiredWinRate.toFixed(1)}% (to break even)`,
  ];

  return lines.join('\n');
}

/**
 * Format equity and drawdown section
 */
function formatEquitySection(equity: AIReportEquityData): string {
  const lines: string[] = [
    '',
    '## Equity Journey',
    '',
    `- Starting Balance: ${formatCurrency(equity.startingBalance)} | Current: ${formatCurrency(equity.currentBalance)}`,
    `- Total Return: ${equity.totalReturnPercent >= 0 ? '+' : ''}${equity.totalReturnPercent.toFixed(2)}%`,
    `- Max Drawdown: ${formatCurrency(equity.maxDrawdown)} (${equity.maxDrawdownPercent.toFixed(1)}% of peak)`,
    `- Trading Days: ${equity.tradingDays}`,
    `- Best Day: ${formatCurrency(equity.bestDay)} | Worst Day: ${formatCurrency(equity.worstDay)}`,
    `- Recovery Times: Longest ${equity.longestRecovery} days | Average ${equity.avgRecovery.toFixed(1)} days`,
    `- Time in Drawdown: ${equity.totalDaysInDrawdown} of ${equity.tradingDays} days (${((equity.totalDaysInDrawdown / equity.tradingDays) * 100).toFixed(1)}%)`,
  ];

  return lines.join('\n');
}

/**
 * Format mistake analysis section
 */
function formatMistakeSection(mistakes: AIReportMistakeData): string {
  const lines: string[] = [
    '',
    '## Behavioral Analysis',
    '',
    `**Mistake Impact:**`,
    `- Trades with Mistakes: ${mistakes.tradesWithMistakes} (${((mistakes.tradesWithMistakes / (mistakes.tradesWithMistakes + mistakes.tradesWithoutMistakes)) * 100).toFixed(1)}%) | P&L: ${formatCurrency(mistakes.tradesWithMistakesPnl)}`,
    `- Trades without Mistakes: ${mistakes.tradesWithoutMistakes} (${((mistakes.tradesWithoutMistakes / (mistakes.tradesWithMistakes + mistakes.tradesWithoutMistakes)) * 100).toFixed(1)}%) | P&L: ${formatCurrency(mistakes.tradesWithoutMistakesPnl)}`,
    `- Rule Violations: ${mistakes.ruleViolations}`,
    '',
  ];

  if (mistakes.topMistakesByFrequency.length > 0) {
    lines.push('**Top Mistakes by Frequency:**');
    mistakes.topMistakesByFrequency.forEach((mistake, i) => {
      lines.push(
        `${i + 1}. ${mistake.type}: ${mistake.count} times (cost: ${formatCurrency(mistake.cost)})`
      );
    });
    lines.push('');
  }

  if (mistakes.costliestMistake) {
    lines.push(
      `**Costliest Mistake:** ${mistakes.costliestMistake.type} (cost: ${formatCurrency(mistakes.costliestMistake.cost)})`
    );
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format trade again analysis section
 */
function formatTradeAgainSection(tradeAgain: AIReportTradeAgainData): string {
  const totalWithResponse =
    tradeAgain.yes.count +
    tradeAgain.no.count +
    tradeAgain.withAdjustment.count;

  if (totalWithResponse === 0) {
    return '';
  }

  const lines: string[] = [
    '',
    '## Trade Replay Decisions',
    '',
    `**Would You Take It Again?**`,
    `- Yes: ${tradeAgain.yes.count} trades, ${(tradeAgain.yes.winRate * 100).toFixed(1)}% WR, ${formatCurrency(tradeAgain.yes.totalPnl)} total, ${formatCurrency(tradeAgain.yes.averagePnl)} avg`,
    `- No: ${tradeAgain.no.count} trades, ${(tradeAgain.no.winRate * 100).toFixed(1)}% WR, ${formatCurrency(tradeAgain.no.totalPnl)} total, ${formatCurrency(tradeAgain.no.averagePnl)} avg`,
    `- With Adjustment: ${tradeAgain.withAdjustment.count} trades, ${(tradeAgain.withAdjustment.winRate * 100).toFixed(1)}% WR, ${formatCurrency(tradeAgain.withAdjustment.totalPnl)} total, ${formatCurrency(tradeAgain.withAdjustment.averagePnl)} avg`,
    '',
    `**Insight:** ${tradeAgain.insight}`,
  ];

  return lines.join('\n');
}

/**
 * Format timing patterns section
 */
function formatTimingSection(
  timeOfDay: AIReportTimeOfDayData,
  dayOfWeek: AIReportDayOfWeekData
): string {
  const lines: string[] = [
    '',
    '## Timing & Pattern Analysis',
    '',
    '**Best Hours (Top 3):**',
  ];

  const sortedHours = [...timeOfDay]
    .filter((h) => h.tradeCount > 0)
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .slice(0, 3);

  sortedHours.forEach((hour) => {
    lines.push(
      `- ${hour.hour}:00: ${hour.tradeCount} trades, ${hour.winRate.toFixed(1)}% WR, ${formatCurrency(hour.totalPnl)}`
    );
  });

  lines.push('');
  lines.push('**Worst Hours (Bottom 3):**');

  const worstHours = [...timeOfDay]
    .filter((h) => h.tradeCount > 0)
    .sort((a, b) => a.totalPnl - b.totalPnl)
    .slice(0, 3);

  worstHours.forEach((hour) => {
    lines.push(
      `- ${hour.hour}:00: ${hour.tradeCount} trades, ${hour.winRate.toFixed(1)}% WR, ${formatCurrency(hour.totalPnl)}`
    );
  });

  lines.push('');
  lines.push('**Day of Week Performance:**');

  dayOfWeek.forEach(
    (day: {
      day: string;
      tradeCount: number;
      winRate: number;
      totalPnl: number;
    }) => {
      lines.push(
        `- ${day.day}: ${day.tradeCount} trades, ${day.winRate.toFixed(1)}% WR, ${formatCurrency(day.totalPnl)}`
      );
    }
  );

  return lines.join('\n');
}

/**
 * Format strategy performance section
 */
function formatStrategySection(strategies: AIReportStrategyData): string {
  if (strategies.length === 0) return '';

  const lines: string[] = ['', '## Strategy Performance', ''];

  strategies.forEach(
    (
      strat: {
        strategy: string;
        tradeCount: number;
        winRate: number;
        totalPnl: number;
        profitFactor: number;
      },
      i: number
    ) => {
      lines.push(
        `${i + 1}. **${strat.strategy || 'Unnamed'}:** ${strat.tradeCount} trades, ${strat.winRate.toFixed(1)}% WR, ${formatCurrency(strat.totalPnl)} (PF: ${strat.profitFactor.toFixed(2)})`
      );
    }
  );

  return lines.join('\n');
}

/**
 * Format hold time analysis section
 */
function formatHoldTimeSection(holdTime: AIReportHoldTimeData): string {
  const lines: string[] = ['', '## Hold Time Performance', ''];

  holdTime.forEach(
    (ht: { bucket: string; tradeCount: number; averagePnl: number }) => {
      lines.push(
        `- ${ht.bucket}: ${ht.tradeCount} trades, Avg P&L: ${formatCurrency(ht.averagePnl)}`
      );
    }
  );

  return lines.join('\n');
}

/**
 * Format trade log section
 */
function formatTradeLogSection(trades: AIReportTrade[]): string {
  const lines: string[] = ['', '## Individual Trades', ''];

  trades.forEach((trade, i) => {
    lines.push(formatTrade(trade, i));
  });

  return lines.join('\n');
}

/**
 * Format questions section
 */
function formatQuestionsSection(): string {
  return `
---

## Analysis Request

Please analyze my trading data and provide:

1. **Edge & Leaks**: What are my biggest strengths and weaknesses based on the numbers?
2. **Pattern Recognition**: What patterns do you see in my timing, strategy selection, and mistake frequency?
3. **Psychological Insights**: Based on my notes and setup quality ratings, what psychological factors are affecting my performance?
4. **Risk Management**: How can I improve my drawdowns and recovery times?
5. **Strategy Optimization**: Which strategies should I focus on or abandon? What setup characteristics lead to my wins vs losses?
6. **Actionable Steps**: Give me 3-5 specific, measurable actions to implement immediately.

Please reference specific numbers and trades in your analysis.
`;
}

/**
 * Format privacy warning header
 */
function formatPrivacyWarning(): string {
  return `# Trading Journal Analysis Request

⚠️ **Privacy Notice**: This report contains your detailed trading data including P&L amounts, trade times, strategies, and psychological notes. Only share with AI services you trust.

---
`;
}

/**
 * Format period information
 */
function formatPeriodInfo(data: AIReportData): string {
  return `
**Analysis Period:** ${data.period.label}
**Date Range:** ${data.period.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${data.period.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
**Total Trades in Period:** ${data.statistics.totalTrades}
**Trades Selected for Analysis:** ${data.selectedTrades.length} trades

---
`;
}

/**
 * Main function to generate AI report
 */
export function generateAIReport(data: AIReportData): string {
  const sections: string[] = [
    formatPrivacyWarning(),
    formatPeriodInfo(data),
    formatPerformanceSummary(data.statistics),
    formatEquitySection(data.equity),
    formatMistakeSection(data.mistakes),
    formatTradeAgainSection(data.tradeAgain),
    formatTimingSection(data.timeOfDay, data.dayOfWeek),
    formatStrategySection(data.strategies),
    formatHoldTimeSection(data.holdTime),
    formatTradeLogSection(data.selectedTrades),
    formatQuestionsSection(),
  ];

  return sections.join('\n');
}

/**
 * Generate full report with ALL trades
 */
export function generateFullAIReport(data: AIReportData): string {
  return generateAIReport(data);
}
