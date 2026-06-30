import type { Trade } from './index';

export type AIReportTrade = Trade;

export type AIReportStatistics = {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  totalPnl: number;
  averageDailyPnl: number;
  averageTradePnl: number;
  pnlStdDev: number;
  totalFees: number;
  averageWin: number;
  averageLoss: number;
  largestGain: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  profitFactor: number;
  expectancy: number;
  realizedRR: number;
  requiredWinRate: number;
  longTrades: {
    count: number;
    winRate: number;
    totalPnl: number;
  };
  shortTrades: {
    count: number;
    winRate: number;
    totalPnl: number;
  };
};

export type AIReportEquityData = {
  startingBalance: number;
  currentBalance: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakValue: number;
  tradingDays: number;
  bestDay: number;
  worstDay: number;
  longestRecovery: number;
  avgRecovery: number;
  totalDaysInDrawdown: number;
};

export type AIReportMistakeData = {
  tradesWithMistakes: number;
  tradesWithMistakesPnl: number;
  tradesWithoutMistakes: number;
  tradesWithoutMistakesPnl: number;
  ruleViolations: number;
  topMistakesByFrequency: Array<{
    type: string;
    count: number;
    cost: number;
  }>;
  costliestMistake: {
    type: string;
    cost: number;
  } | null;
};

export type AIReportTimeOfDayData = Array<{
  hour: number;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
}>;

export type AIReportDayOfWeekData = Array<{
  day: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
}>;

export type AIReportStrategyData = Array<{
  strategy: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
  profitFactor: number;
}>;

export type AIReportHoldTimeData = Array<{
  bucket: string;
  tradeCount: number;
  averagePnl: number;
}>;

export type AIReportTradeAgainData = {
  yes: { count: number; winRate: number; totalPnl: number; averagePnl: number };
  no: { count: number; winRate: number; totalPnl: number; averagePnl: number };
  withAdjustment: {
    count: number;
    winRate: number;
    totalPnl: number;
    averagePnl: number;
  };
  insight: string;
};

export type AIReportData = {
  period: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
  statistics: AIReportStatistics;
  equity: AIReportEquityData;
  mistakes: AIReportMistakeData;
  timeOfDay: AIReportTimeOfDayData;
  dayOfWeek: AIReportDayOfWeekData;
  strategies: AIReportStrategyData;
  holdTime: AIReportHoldTimeData;
  tradeAgain: AIReportTradeAgainData;
  selectedTrades: AIReportTrade[];
  options: {
    tradeDateLimit: number | null;
    includeIndividualTrades: boolean;
  };
};
