import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

import { calculatePnl } from '../schemas/trade';

import type { Trade } from '../types';

type CsvRow = {
  symbol?: string;
  shares?: string;
  entryPrice?: string;
  entryTime?: string;
  exitPrice?: string;
  exitTime?: string;
  setup?: string;
  psychology?: string;
  whatWorked?: string;
  whatFailed?: string;
  link?: string;
};

export type ImportResult = {
  imported: Trade[];
  skipped: number;
  errors: string[];
};

// Generate a unique key for trade deduplication
export function generateTradeKey(trade: {
  symbol: string;
  entryTime: string;
  quantity: number;
}): string {
  return `${trade.symbol}_${trade.entryTime}_${trade.quantity}`;
}

// Parse CSV row to Trade object
function parseCsvRowToTrade(row: CsvRow): Trade | null {
  // Skip empty rows, summary rows, or rows without required fields
  if (
    !row.symbol ||
    !row.shares ||
    !row.entryPrice ||
    !row.exitPrice ||
    !row.entryTime ||
    !row.exitTime ||
    row.symbol.trim() === '' ||
    row.symbol.toLowerCase().includes('summary')
  ) {
    return null;
  }

  try {
    // Parse numeric values
    const quantity = parseFloat(row.shares);
    const entryPrice = parseFloat(row.entryPrice);
    const exitPrice = parseFloat(row.exitPrice);

    // Validate required numeric fields
    if (isNaN(quantity) || isNaN(entryPrice) || isNaN(exitPrice)) {
      return null;
    }

    // Parse datetime strings directly
    // Supports formats like: "2026-01-09 8:58:00 AM", "2025-12-31", "2026-01-07 8:48"
    const entryTime = new Date(row.entryTime);
    const exitTime = new Date(row.exitTime);

    // Validate dates
    if (isNaN(entryTime.getTime()) || isNaN(exitTime.getTime())) {
      return null;
    }

    // Calculate P&L (always assume long for imported trades)
    const { pnl, pnlPercent } = calculatePnl(
      entryPrice,
      exitPrice,
      quantity,
      'long'
    );

    // Combine notes from multiple fields
    const notesParts = [];
    if (row.setup) notesParts.push(`Setup: ${row.setup}`);
    if (row.psychology) notesParts.push(`Psychology: ${row.psychology}`);
    if (row.whatWorked) notesParts.push(`What worked: ${row.whatWorked}`);
    if (row.whatFailed) notesParts.push(`What failed: ${row.whatFailed}`);
    if (row.link) notesParts.push(`Link: ${row.link}`);

    const notes = notesParts.join('\n').substring(0, 500);

    return {
      id: uuidv4(),
      symbol: row.symbol.toUpperCase(),
      entryPrice,
      exitPrice,
      quantity,
      entryTime,
      exitTime,
      side: 'long',
      strategy: row.setup?.substring(0, 50),
      notes: notes || undefined,
      pnl,
      pnlPercent,
    };
  } catch (error) {
    console.error('Error parsing CSV row:', error);
    return null;
  }
}

export async function parseCsvFile(csvContent: string): Promise<ImportResult> {
  return new Promise((resolve) => {
    const imported: Trade[] = [];
    const errors: string[] = [];
    let skipped = 0;

    Papa.parse<CsvRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row, index) => {
          try {
            const trade = parseCsvRowToTrade(row);
            if (trade) {
              imported.push(trade);
            } else {
              skipped++;
            }
          } catch (error) {
            errors.push(
              `Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            skipped++;
          }
        });

        resolve({ imported, skipped, errors });
      },
      error: (error: Error) => {
        errors.push(`Parse error: ${error.message}`);
        resolve({ imported, skipped, errors });
      },
    });
  });
}
