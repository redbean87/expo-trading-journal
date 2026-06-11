'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.calculateDailyPnl = calculateDailyPnl;
exports.useDailyPnl = useDailyPnl;
const react_1 = require('react');
const calendar_helpers_1 = require('../utils/calendar-helpers');
function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}
function calculateDailyPnl(trades) {
  const dailyPnlMap = new Map();
  let maxProfit = 0;
  let maxLoss = 0;
  for (const trade of trades) {
    const dateKey = (0, calendar_helpers_1.formatDateKey)(trade.exitTime);
    const existing = dailyPnlMap.get(dateKey);
    const isWin = trade.pnl > 0;
    const isLoss = trade.pnl < 0;
    if (existing) {
      existing.totalPnl += trade.pnl;
      existing.tradeCount += 1;
      existing.winCount += isWin ? 1 : 0;
      existing.lossCount += isLoss ? 1 : 0;
      existing.trades.push(trade);
    } else {
      dailyPnlMap.set(dateKey, {
        dateKey,
        date: startOfDay(trade.exitTime),
        totalPnl: trade.pnl,
        tradeCount: 1,
        winCount: isWin ? 1 : 0,
        lossCount: isLoss ? 1 : 0,
        trades: [trade],
      });
    }
  }
  // Calculate max values for color scaling
  for (const day of dailyPnlMap.values()) {
    if (day.totalPnl > maxProfit) {
      maxProfit = day.totalPnl;
    }
    if (day.totalPnl < 0 && Math.abs(day.totalPnl) > maxLoss) {
      maxLoss = Math.abs(day.totalPnl);
    }
  }
  return {
    dailyPnlMap,
    maxProfit,
    maxLoss,
  };
}
function useDailyPnl(trades) {
  return (0, react_1.useMemo)(() => {
    const data = calculateDailyPnl(trades);
    const getDayData = (date) => {
      return data.dailyPnlMap.get((0, calendar_helpers_1.formatDateKey)(date));
    };
    return {
      ...data,
      getDayData,
    };
  }, [trades]);
}
