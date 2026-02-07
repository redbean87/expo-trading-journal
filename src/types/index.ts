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

export type UserProfile = {
  displayName: string | null;
};

export type CustomColors = {
  primary: string; // Accent color (#RRGGBB)
  profit: string; // Trading green (#RRGGBB)
  loss: string; // Trading red (#RRGGBB)
  selectedBackground: string; // Selected/active element background (#RRGGBB)
  selectedText: string; // Text color on selected/active elements (#RRGGBB)
};

export type CustomThemePreset = 'default' | 'custom';
