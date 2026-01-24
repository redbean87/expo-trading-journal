import { Trade } from '../../types';
import { calculateDailyPnl } from '../use-daily-pnl';

const createTrade = (overrides: Partial<Trade> = {}): Trade => ({
  id: Math.random().toString(),
  symbol: 'AAPL',
  entryPrice: 100,
  exitPrice: 110,
  quantity: 10,
  entryTime: new Date(2024, 0, 15, 9, 30),
  exitTime: new Date(2024, 0, 15, 15, 30),
  side: 'long',
  pnl: 100,
  pnlPercent: 10,
  ...overrides,
});

describe('calculateDailyPnl', () => {
  it('should return empty map for no trades', () => {
    const result = calculateDailyPnl([]);

    expect(result.dailyPnlMap.size).toBe(0);
    expect(result.maxProfit).toBe(0);
    expect(result.maxLoss).toBe(0);
  });

  it('should aggregate trades by exit date', () => {
    const trades = [
      createTrade({
        exitTime: new Date(2024, 0, 15, 10, 0),
        pnl: 100,
      }),
      createTrade({
        exitTime: new Date(2024, 0, 15, 14, 0),
        pnl: 50,
      }),
    ];

    const result = calculateDailyPnl(trades);

    expect(result.dailyPnlMap.size).toBe(1);
    const dayData = result.dailyPnlMap.get('2024-01-15');
    expect(dayData?.totalPnl).toBe(150);
    expect(dayData?.tradeCount).toBe(2);
  });

  it('should separate trades on different days', () => {
    const trades = [
      createTrade({
        exitTime: new Date(2024, 0, 15, 10, 0),
        pnl: 100,
      }),
      createTrade({
        exitTime: new Date(2024, 0, 16, 10, 0),
        pnl: -50,
      }),
    ];

    const result = calculateDailyPnl(trades);

    expect(result.dailyPnlMap.size).toBe(2);
    expect(result.dailyPnlMap.get('2024-01-15')?.totalPnl).toBe(100);
    expect(result.dailyPnlMap.get('2024-01-16')?.totalPnl).toBe(-50);
  });

  it('should calculate maxProfit correctly', () => {
    const trades = [
      createTrade({ exitTime: new Date(2024, 0, 15), pnl: 100 }),
      createTrade({ exitTime: new Date(2024, 0, 16), pnl: 200 }),
      createTrade({ exitTime: new Date(2024, 0, 17), pnl: -50 }),
    ];

    const result = calculateDailyPnl(trades);

    expect(result.maxProfit).toBe(200);
  });

  it('should calculate maxLoss correctly', () => {
    const trades = [
      createTrade({ exitTime: new Date(2024, 0, 15), pnl: 100 }),
      createTrade({ exitTime: new Date(2024, 0, 16), pnl: -150 }),
      createTrade({ exitTime: new Date(2024, 0, 17), pnl: -50 }),
    ];

    const result = calculateDailyPnl(trades);

    expect(result.maxLoss).toBe(150);
  });

  it('should aggregate losses within same day for maxLoss calculation', () => {
    const trades = [
      createTrade({ exitTime: new Date(2024, 0, 15, 10, 0), pnl: -100 }),
      createTrade({ exitTime: new Date(2024, 0, 15, 14, 0), pnl: -50 }),
    ];

    const result = calculateDailyPnl(trades);

    // Total loss for the day is -150
    expect(result.maxLoss).toBe(150);
  });

  it('should store trades array in dayData', () => {
    const trade1 = createTrade({
      id: 'trade1',
      exitTime: new Date(2024, 0, 15, 10, 0),
      pnl: 100,
    });
    const trade2 = createTrade({
      id: 'trade2',
      exitTime: new Date(2024, 0, 15, 14, 0),
      pnl: 50,
    });

    const result = calculateDailyPnl([trade1, trade2]);

    const dayData = result.dailyPnlMap.get('2024-01-15');
    expect(dayData?.trades).toHaveLength(2);
    expect(dayData?.trades[0].id).toBe('trade1');
    expect(dayData?.trades[1].id).toBe('trade2');
  });

  it('should set date to start of day', () => {
    const trades = [
      createTrade({
        exitTime: new Date(2024, 0, 15, 14, 30, 45),
        pnl: 100,
      }),
    ];

    const result = calculateDailyPnl(trades);
    const dayData = result.dailyPnlMap.get('2024-01-15');

    expect(dayData?.date.getHours()).toBe(0);
    expect(dayData?.date.getMinutes()).toBe(0);
    expect(dayData?.date.getSeconds()).toBe(0);
    expect(dayData?.date.getMilliseconds()).toBe(0);
  });

  it('should handle mixed profit and loss days', () => {
    const trades = [
      createTrade({ exitTime: new Date(2024, 0, 15), pnl: 500 }),
      createTrade({ exitTime: new Date(2024, 0, 16), pnl: -300 }),
      createTrade({ exitTime: new Date(2024, 0, 17), pnl: 200 }),
      createTrade({ exitTime: new Date(2024, 0, 18), pnl: -100 }),
    ];

    const result = calculateDailyPnl(trades);

    expect(result.dailyPnlMap.size).toBe(4);
    expect(result.maxProfit).toBe(500);
    expect(result.maxLoss).toBe(300);
  });
});
