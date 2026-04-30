export const MARKET_CONDITIONS = [
  'Trend',
  'Range',
  'Choppy',
  'High Momentum',
] as const;

export type MarketCondition = (typeof MARKET_CONDITIONS)[number];
