import { randomUUID } from 'expo-crypto';
import Papa from 'papaparse';

import { calculatePnl } from '../schemas/trade';
import { useTimezoneStore } from '../store/timezone-store';

import type { Trade, TradeSide } from '../types';

// Get timezone offset in milliseconds between UTC and a timezone for a given date
function getTimezoneOffsetMs(timezone: string, date: Date): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = date.toLocaleString('en-US', { timeZone: timezone });
  const utcDate = new Date(utcStr);
  const tzDate = new Date(tzStr);
  return utcDate.getTime() - tzDate.getTime();
}

// Parse date string as local time
function parseAsLocal(dateStr: string): Date {
  // Handle date-only format "YYYY-MM-DD" first to avoid UTC interpretation
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00`);
  }

  // Try native parsing (works on web/V8)
  const nativeDate = new Date(dateStr);
  if (!isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  // Handle "YYYY-MM-DD H:MM:SS AM/PM" format
  const match = dateStr.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i
  );
  if (match) {
    const [, datePart, hourStr, minutes, seconds, meridiem] = match;
    let hours = parseInt(hourStr, 10);

    if (meridiem) {
      const isPM = meridiem.toUpperCase() === 'PM';
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
    }

    const isoString = `${datePart}T${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    return new Date(isoString);
  }

  return new Date(NaN);
}

// Parse date strings, interpreting them as being in the specified timezone
function parseDateTime(dateStr: string, sourceTimezone?: string): Date {
  const localDate = parseAsLocal(dateStr);

  if (isNaN(localDate.getTime()) || !sourceTimezone) {
    return localDate;
  }

  // Get local timezone
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (sourceTimezone === localTimezone) {
    return localDate;
  }

  // Adjust: the date was parsed as local, but should have been parsed as source timezone
  const localOffset = getTimezoneOffsetMs(localTimezone, localDate);
  const sourceOffset = getTimezoneOffsetMs(sourceTimezone, localDate);
  const adjustment = sourceOffset - localOffset;

  return new Date(localDate.getTime() + adjustment);
}

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
  confidence?: string;
  ruleViolation?: string;
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

function parseCsvRowToTrade(row: CsvRow, timezone?: string): Trade | null {
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

    const entryTime = parseDateTime(row.entryTime, timezone);
    const exitTime = parseDateTime(row.exitTime, timezone);

    if (isNaN(entryTime.getTime()) || isNaN(exitTime.getTime())) {
      return null;
    }

    const { pnl, pnlPercent } = calculatePnl(
      entryPrice,
      exitPrice,
      quantity,
      detectedSide
    );

    // Build notes from link field only (psychology/whatWorked/whatFailed are now separate fields)
    const notes = row.link ? `Link: ${row.link}` : undefined;

    // Parse confidence (1-5 scale)
    let confidence: number | undefined;
    if (row.confidence) {
      const parsed = parseFloat(row.confidence);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        confidence = Math.round(parsed);
      }
    }

    // Parse ruleViolation (treat "n/a" as undefined)
    let ruleViolation: string | undefined;
    if (row.ruleViolation) {
      const trimmed = row.ruleViolation.trim();
      if (trimmed && trimmed.toLowerCase() !== 'n/a') {
        ruleViolation = trimmed.substring(0, 200);
      }
    }

    return {
      id: randomUUID(),
      symbol: row.symbol.toUpperCase(),
      entryPrice,
      exitPrice,
      quantity,
      entryTime,
      exitTime,
      side: detectedSide,
      strategy: row.setup?.substring(0, 50),
      notes: notes?.substring(0, 500),
      psychology: row.psychology?.substring(0, 50),
      whatWorked: row.whatWorked?.substring(0, 500),
      whatFailed: row.whatFailed?.substring(0, 500),
      confidence,
      ruleViolation,
      pnl,
      pnlPercent,
    };
  } catch (error) {
    console.error('Error parsing CSV row:', error);
    return null;
  }
}

export async function parseCsvFile(csvContent: string): Promise<ImportResult> {
  // Get timezone from store (for use outside React components)
  const timezone = useTimezoneStore.getState().timezone;

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
            const trade = parseCsvRowToTrade(row, timezone);
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
