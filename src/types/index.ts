export interface Trade {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: Date;
  exitTime: Date;
  side: 'long' | 'short';
  strategy?: string;
  notes?: string;
  pnl: number;
  pnlPercent: number;
}

export interface TradeFormData {
  symbol: string;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  entryTime: Date;
  exitTime: Date;
  side: 'long' | 'short';
  strategy?: string;
  notes?: string;
}
