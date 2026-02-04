export type { Trade, TradeFormData, TradeSide } from '../schemas/trade';
export type { DailyPnl } from '../hooks/use-daily-pnl';
export type { NavigationMode } from '../hooks/use-navigation-mode';

export type AnalyticsSegment = 'overview' | 'timing' | 'charts' | 'psychology';

export type Attachment = {
  id: string;
  storageKey: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: number;
};

export type PendingImage = {
  uri: string;
  filename: string;
  contentType: string;
  size: number;
};
