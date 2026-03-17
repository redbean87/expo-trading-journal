import { Trade } from '../../types';
import { calculateHoldTimeHistogram } from '../use-hold-time-histogram';

const createTrade = (
  holdMs: number,
  pnl: number,
  overrides: Partial<Trade> = {}
): Trade => {
  const entryTime = new Date(2024, 0, 15, 9, 30);
  const exitTime = new Date(entryTime.getTime() + holdMs);
  return {
    id: Math.random().toString(),
    symbol: 'AAPL',
    entryPrice: 100,
    exitPrice: 110,
    quantity: 10,
    entryTime,
    exitTime,
    side: 'long',
    pnl,
    pnlPercent: 10,
    ...overrides,
  };
};

const SEC = 1_000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;

describe('calculateHoldTimeHistogram', () => {
  it('returns 7 bins with zero counts for no trades', () => {
    const result = calculateHoldTimeHistogram([]);
    expect(result).toHaveLength(7);
    expect(result.every((bin) => bin.count === 0)).toBe(true);
    expect(result.every((bin) => bin.avgPnl === 0)).toBe(true);
  });

  it('bins a trade under 1 minute into the first bucket', () => {
    const result = calculateHoldTimeHistogram([createTrade(30 * SEC, 100)]);
    expect(result[0].label).toBe('<1m');
    expect(result[0].count).toBe(1);
    expect(result[0].avgPnl).toBe(100);
  });

  it('bins a trade of exactly 1 minute into the 1–5m bucket', () => {
    const result = calculateHoldTimeHistogram([createTrade(1 * MIN, 50)]);
    expect(result[1].label).toBe('1–5m');
    expect(result[1].count).toBe(1);
  });

  it('bins a 10-minute trade into 5–15m bucket', () => {
    const result = calculateHoldTimeHistogram([createTrade(10 * MIN, -20)]);
    expect(result[2].label).toBe('5–15m');
    expect(result[2].count).toBe(1);
    expect(result[2].avgPnl).toBe(-20);
  });

  it('bins a 20-minute trade into 15–30m bucket', () => {
    const result = calculateHoldTimeHistogram([createTrade(20 * MIN, 0)]);
    expect(result[3].label).toBe('15–30m');
    expect(result[3].count).toBe(1);
  });

  it('bins a 45-minute trade into 30m–1h bucket', () => {
    const result = calculateHoldTimeHistogram([createTrade(45 * MIN, 75)]);
    expect(result[4].label).toBe('30m–1h');
    expect(result[4].count).toBe(1);
  });

  it('bins a 2-hour trade into 1–4h bucket', () => {
    const result = calculateHoldTimeHistogram([createTrade(2 * HOUR, 200)]);
    expect(result[5].label).toBe('1–4h');
    expect(result[5].count).toBe(1);
  });

  it('bins a 5-hour trade into the 4h+ bucket', () => {
    const result = calculateHoldTimeHistogram([createTrade(5 * HOUR, 300)]);
    expect(result[6].label).toBe('4h+');
    expect(result[6].count).toBe(1);
  });

  it('averages pnl correctly across multiple trades in same bin', () => {
    const trades = [
      createTrade(2 * MIN, 100),
      createTrade(3 * MIN, -50),
      createTrade(4 * MIN, 200),
    ];
    const result = calculateHoldTimeHistogram(trades);
    expect(result[1].count).toBe(3);
    expect(result[1].avgPnl).toBeCloseTo((100 - 50 + 200) / 3);
  });

  it('places trades across multiple bins correctly', () => {
    const trades = [
      createTrade(30 * SEC, 10), // <1m
      createTrade(10 * MIN, -20), // 5–15m
      createTrade(2 * HOUR, 50), // 1–4h
    ];
    const result = calculateHoldTimeHistogram(trades);
    expect(result[0].count).toBe(1);
    expect(result[2].count).toBe(1);
    expect(result[5].count).toBe(1);
    // Other bins empty
    expect(result[1].count).toBe(0);
    expect(result[3].count).toBe(0);
    expect(result[4].count).toBe(0);
    expect(result[6].count).toBe(0);
  });
});
