import { Trade } from '../types';

export type PeriodType = 'week' | 'month';

export type PeriodSummary = {
  periodKey: string;
  periodLabel: string;
  startDate: Date;
  endDate: Date;
  tradeCount: number;
  totalPnl: number;
  winRate: number;
  avgTradePnl: number;
};

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const weekNumber = getISOWeekNumber(date);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getWeekLabel(date: Date): string {
  const monday = getWeekStart(date);
  return `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - daysFromMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return new Date(nextMonth.getTime() - 1);
}

function calculatePeriodMetrics(
  trades: Trade[]
): Pick<PeriodSummary, 'tradeCount' | 'totalPnl' | 'winRate' | 'avgTradePnl'> {
  const tradeCount = trades.length;
  if (tradeCount === 0) {
    return { tradeCount: 0, totalPnl: 0, winRate: 0, avgTradePnl: 0 };
  }

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const winRate = (winningTrades / tradeCount) * 100;
  const avgTradePnl = totalPnl / tradeCount;

  return { tradeCount, totalPnl, winRate, avgTradePnl };
}

export function groupTradesByPeriod(
  trades: Trade[],
  periodType: PeriodType
): PeriodSummary[] {
  if (trades.length === 0) return [];

  const getKey = periodType === 'week' ? getWeekKey : getMonthKey;
  const getLabel = periodType === 'week' ? getWeekLabel : getMonthLabel;
  const getStart = periodType === 'week' ? getWeekStart : getMonthStart;
  const getEnd = periodType === 'week' ? getWeekEnd : getMonthEnd;

  const grouped = new Map<string, Trade[]>();

  for (const trade of trades) {
    const key = getKey(trade.exitTime);
    const existing = grouped.get(key) ?? [];
    existing.push(trade);
    grouped.set(key, existing);
  }

  const periods: PeriodSummary[] = [];

  for (const [periodKey, periodTrades] of grouped) {
    const sampleDate = periodTrades[0].exitTime;
    const metrics = calculatePeriodMetrics(periodTrades);

    periods.push({
      periodKey,
      periodLabel: getLabel(sampleDate),
      startDate: getStart(sampleDate),
      endDate: getEnd(sampleDate),
      ...metrics,
    });
  }

  periods.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  return periods;
}
