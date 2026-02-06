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
  primaryContainer?: string; // Active/selected background (#RRGGBB)
  onPrimaryContainer?: string; // Text/icon color on primaryContainer (#RRGGBB)

  // Optional - not currently used in UI (kept for backward compatibility)
  background?: string;
  light?: {
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  dark?: {
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
  };
};

export type CustomThemePreset = 'default' | 'custom';
