import Papa from 'papaparse';

import type { Trade } from '../types';

/**
 * Format date to match import format: "YYYY-MM-DD H:MM:SS AM/PM"
 */
function formatDateForCsv(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${meridiem}`;
}

type CsvExportRow = {
  symbol: string;
  shares: number;
  entryPrice: number;
  entryTime: string;
  exitPrice: number;
  exitTime: string;
  side: string;
  setup: string;
  notes: string;
  pnl: number;
  pnlPercent: number;
};

function tradeToExportRow(trade: Trade): CsvExportRow {
  return {
    symbol: trade.symbol,
    shares: trade.quantity,
    entryPrice: trade.entryPrice,
    entryTime: formatDateForCsv(trade.entryTime),
    exitPrice: trade.exitPrice,
    exitTime: formatDateForCsv(trade.exitTime),
    side: trade.side,
    setup: trade.strategy ?? '',
    notes: trade.notes ?? '',
    pnl: trade.pnl,
    pnlPercent: trade.pnlPercent,
  };
}

export function tradesToCsv(trades: Trade[]): string {
  const rows = trades.map(tradeToExportRow);
  return Papa.unparse(rows, {
    header: true,
    columns: [
      'symbol',
      'shares',
      'entryPrice',
      'entryTime',
      'exitPrice',
      'exitTime',
      'side',
      'setup',
      'notes',
      'pnl',
      'pnlPercent',
    ],
  });
}

export function generateExportFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return `trades-export-${dateStr}.csv`;
}
