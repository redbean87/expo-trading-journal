import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

import { calculatePnl } from '../schemas/trade';

import type { Trade, TradeSide } from '../types';

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
  side?: string;
  direction?: string;
  type?: string;
  action?: string;
};

export type ImportResult = {
  imported: Trade[];
  skipped: number;
  errors: string[];
};

export function generateTradeKey(trade: {
  symbol: string;
  entryTime: string;
  quantity: number;
}): string {
  return `${trade.symbol}_${trade.entryTime}_${trade.quantity}`;
}

function detectTradeSide(row: CsvRow, quantity: number): TradeSide {
  // Strategy 1: Explicit side column
  const sideValue = (row.side || row.direction || row.type || row.action || '')
    .toLowerCase()
    .trim();

  if (sideValue) {
    // Check for short indicators
    if (
      sideValue === 'short' ||
      sideValue === 'sell' ||
      sideValue === 's' ||
      sideValue === '-1' ||
      sideValue === 'sell short'
    ) {
      return 'short';
    }
    // Check for long indicators
    if (
      sideValue === 'long' ||
      sideValue === 'buy' ||
      sideValue === 'l' ||
      sideValue === '1'
    ) {
      return 'long';
    }
  }

  // Strategy 2: Negative quantity indicates short
  if (quantity < 0) {
    return 'short';
  }

  // Default to long if no side detected
  return 'long';
}

function parseCsvRowToTrade(row: CsvRow): Trade | null {
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
    const rawQuantity = parseFloat(row.shares);
    const entryPrice = parseFloat(row.entryPrice);
    const exitPrice = parseFloat(row.exitPrice);

    if (isNaN(rawQuantity) || isNaN(entryPrice) || isNaN(exitPrice)) {
      return null;
    }

    // Detect side and normalize quantity
    const detectedSide = detectTradeSide(row, rawQuantity);
    const quantity = Math.abs(rawQuantity);

    const entryTime = new Date(row.entryTime);
    const exitTime = new Date(row.exitTime);

    if (isNaN(entryTime.getTime()) || isNaN(exitTime.getTime())) {
      return null;
    }

    const { pnl, pnlPercent } = calculatePnl(
      entryPrice,
      exitPrice,
      quantity,
      detectedSide
    );

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
      side: detectedSide,
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
