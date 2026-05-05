import Decimal from 'decimal.js';
import Papa from 'papaparse';

import type { Trade } from '../types';
import type { ImportResult } from './csv-import';

export function isTosAccountStatement(content: string): boolean {
  return content.trimStart().startsWith('Account Statement for');
}

type CashBalanceRow = {
  DATE: string;
  TIME: string;
  TYPE: string;
  'REF #': string;
  DESCRIPTION: string;
  'Misc Fees': string;
  'Commissions & Fees': string;
  AMOUNT: string;
  BALANCE: string;
};

type TradeHistoryRow = {
  'Exec Time': string;
  Side: string;
  Qty: string;
  Symbol: string;
  Price: string;
  'Net Price': string;
  'Order Type': string;
};

type ParsedFill = {
  date: string;
  time: string;
  action: 'BOT' | 'SOLD';
  symbol: string;
  quantity: number;
  price: number;
  miscFees: number;
  commissions: number;
  amount: number; // positive = proceeds (SOLD), negative = cost (BOT)
  balance: number; // running account balance after this fill (Cash Balance source only)
  refNum: string; // order reference number (Cash Balance source only)
  orderType: string; // LMT | MKT (Trade History source only)
};

// Accumulates all fills for one complete position lifecycle (0 shares → N shares → 0 shares)
type PositionAccum = {
  totalBuyQty: number;
  buySum: number; // sum(qty * price) for weighted avg entry display price
  totalBuyAmount: number; // sum(|AMOUNT|) for exact cost basis
  totalBuyMiscFees: number;
  totalBuyCommissions: number;
  firstBuyDate: string;
  firstBuyTime: string;
  firstBuyRef: string; // REF # of first buy fill (Cash Balance source only)
  totalSellQty: number;
  sellSum: number; // sum(qty * price) for weighted avg exit display price
  totalSellAmount: number; // sum(AMOUNT) for exact proceeds
  totalSellMiscFees: number;
  totalSellCommissions: number;
  firstSellDate: string | null;
  firstSellTime: string | null;
  lastBalance: number; // running balance after last sell fill (Cash Balance source only)
  orderType: string; // LMT | MKT from first buy fill (Trade History source only)
};

function newAccum(): PositionAccum {
  return {
    totalBuyQty: 0,
    buySum: 0,
    totalBuyAmount: 0,
    totalBuyMiscFees: 0,
    totalBuyCommissions: 0,
    firstBuyDate: '',
    firstBuyTime: '',
    firstBuyRef: '',
    totalSellQty: 0,
    sellSum: 0,
    totalSellAmount: 0,
    totalSellMiscFees: 0,
    totalSellCommissions: 0,
    firstSellDate: null,
    firstSellTime: null,
    lastBalance: 0,
    orderType: '',
  };
}

function extractSection(content: string, sectionName: string): string | null {
  const lines = content.replace(/\r\n/g, '\n').split('\n');

  let sectionStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === sectionName) {
      sectionStart = i + 1;
      break;
    }
  }

  if (sectionStart === -1) return null;

  let sectionEnd = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      sectionEnd = i;
      break;
    }
  }

  return lines.slice(sectionStart, sectionEnd).join('\n');
}

function parseDescription(desc: string): {
  action: 'BOT' | 'SOLD';
  quantity: number;
  symbol: string;
  price: number;
} | null {
  const normalized = desc.replace(/(\d),(\d)/g, '$1$2').trim();
  const match = normalized.match(
    /^(BOT|SOLD)\s+[+-]?(\d+)\s+([A-Z]+)\s+@([\d.]+)/
  );
  if (!match) return null;

  return {
    action: match[1] as 'BOT' | 'SOLD',
    quantity: parseInt(match[2], 10),
    symbol: match[3],
    price: parseFloat(match[4]),
  };
}

function parseAmount(val: string): number {
  if (!val || val.trim() === '') return 0;
  const num = parseFloat(val.replace(/,/g, '').trim());
  return isNaN(num) ? 0 : num;
}

function parseFee(val: string): number {
  if (!val || val.trim() === '' || val.trim() === '--') return 0;
  const cleaned = val.replace(/[$,()]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

function parseTosDateTime(dateStr: string, timeStr: string): Date {
  const dateParts = dateStr.trim().split('/');
  if (dateParts.length !== 3) return new Date(NaN);

  const month = parseInt(dateParts[0], 10) - 1;
  const day = parseInt(dateParts[1], 10);
  const year = 2000 + parseInt(dateParts[2], 10);

  const timeParts = timeStr.trim().split(':');
  const hours = timeParts[0] ? parseInt(timeParts[0], 10) : 0;
  const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

  return new Date(year, month, day, hours, minutes, seconds);
}

function parseCashBalanceFills(
  section: string,
  errors: string[]
): ParsedFill[] {
  const fills: ParsedFill[] = [];

  Papa.parse<CashBalanceRow>(section, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      for (const row of results.data) {
        if (row.TYPE?.trim() !== 'TRD') continue;

        const parsed = parseDescription(row.DESCRIPTION || '');
        if (!parsed) continue;

        const rawRef = row['REF #']?.trim() || '';
        const refNum = rawRef.replace(/^="?|"?$/g, '');
        fills.push({
          date: row.DATE?.trim() || '',
          time: row.TIME?.trim() || '',
          ...parsed,
          miscFees: parseFee(row['Misc Fees']),
          commissions: parseFee(row['Commissions & Fees']),
          amount: parseAmount(row.AMOUNT || ''),
          balance: parseAmount(row.BALANCE || ''),
          refNum,
          orderType: '',
        });
      }
    },
    error: (err: Error) => {
      errors.push(`Parse error: ${err.message}`);
    },
  });

  return fills;
}

function parseTradeHistoryFills(
  section: string,
  errors: string[]
): ParsedFill[] {
  const fills: ParsedFill[] = [];

  Papa.parse<TradeHistoryRow>(section, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      for (const row of results.data) {
        const execTime = row['Exec Time']?.trim();
        const side = row['Side']?.trim();
        const qtyStr = row['Qty']?.trim();
        const symbol = row['Symbol']?.trim();
        const netPriceStr = row['Net Price']?.trim();
        const priceStr = row['Price']?.trim();

        if (!execTime || !side || !qtyStr || !symbol || !priceStr) continue;

        const action = side === 'BUY' ? 'BOT' : side === 'SELL' ? 'SOLD' : null;
        if (!action) continue;

        const qty = parseInt(qtyStr.replace(/[+-]/, ''), 10);
        const price = parseFloat(netPriceStr || priceStr);
        if (isNaN(qty) || qty === 0 || isNaN(price)) continue;

        const spaceIdx = execTime.indexOf(' ');
        const date = spaceIdx >= 0 ? execTime.slice(0, spaceIdx) : execTime;
        const time = spaceIdx >= 0 ? execTime.slice(spaceIdx + 1) : '00:00:00';
        const orderType = row['Order Type']?.trim() || '';

        fills.push({
          date,
          time,
          action,
          symbol,
          quantity: qty,
          price,
          miscFees: 0,
          commissions: 0,
          amount: action === 'SOLD' ? qty * price : -(qty * price),
          balance: 0,
          refNum: '',
          orderType,
        });
      }
    },
    error: (err: Error) => {
      errors.push(`Parse error: ${err.message}`);
    },
  });

  return fills;
}

function emitTrade(
  symbol: string,
  accum: PositionAccum,
  source: 'cash-balance' | 'trade-history'
): Omit<Trade, 'id'> | null {
  const qty = Math.min(accum.totalBuyQty, accum.totalSellQty);
  if (qty === 0) return null;

  const entryTime = parseTosDateTime(accum.firstBuyDate, accum.firstBuyTime);
  const exitTime = parseTosDateTime(accum.firstSellDate!, accum.firstSellTime!);

  if (isNaN(entryTime.getTime()) || isNaN(exitTime.getTime())) return null;

  // Display prices: weighted avg from description prices
  const roundedEntry = parseFloat(
    (accum.buySum / accum.totalBuyQty).toFixed(4)
  );
  const roundedExit = parseFloat(
    (accum.sellSum / accum.totalSellQty).toFixed(4)
  );

  const fees = parseFloat(
    (accum.totalBuyMiscFees + accum.totalSellMiscFees).toFixed(2)
  );
  const commissions = parseFloat(
    (accum.totalBuyCommissions + accum.totalSellCommissions).toFixed(2)
  );

  // P&L: use exact AMOUNT column values to match Schwab's cost basis/proceeds
  const pnl = new Decimal(accum.totalSellAmount)
    .minus(accum.totalBuyAmount)
    .minus(fees)
    .minus(commissions)
    .toDecimalPlaces(3)
    .toNumber();

  const pnlPercent = new Decimal(pnl)
    .dividedBy(accum.totalBuyAmount)
    .times(100)
    .toDecimalPlaces(3)
    .toNumber();

  const importId =
    source === 'cash-balance' && accum.firstBuyRef
      ? `cb-${accum.firstBuyRef}`
      : undefined;

  return {
    symbol: symbol.toUpperCase(),
    entryPrice: roundedEntry,
    exitPrice: roundedExit,
    quantity: qty,
    entryTime,
    exitTime,
    side: 'long',
    fees: fees > 0 ? fees : undefined,
    commissions: commissions > 0 ? commissions : undefined,
    pnl,
    pnlPercent,
    importedFrom: source,
    importId,
    orderType: accum.orderType || undefined,
    accountBalanceAfter: accum.lastBalance > 0 ? accum.lastBalance : undefined,
  };
}

export function parseTosAccountStatement(content: string): ImportResult {
  const imported: Omit<Trade, 'id'>[] = [];
  const errors: string[] = [];
  let skipped = 0;

  // Try Cash Balance section first (old TOS format with TRD rows)
  let fills: ParsedFill[] = [];
  let fillSource: 'cash-balance' | 'trade-history' = 'cash-balance';
  const cashSection = extractSection(content, 'Cash Balance');
  if (cashSection) {
    fills = parseCashBalanceFills(cashSection, errors);
  }

  // Fall back to Account Trade History (newer Schwab format)
  if (fills.length === 0) {
    const tradeHistorySection = extractSection(
      content,
      'Account Trade History'
    );
    if (tradeHistorySection) {
      fills = parseTradeHistoryFills(tradeHistorySection, errors);
      fillSource = 'trade-history';
    }
  }

  // When using Cash Balance as primary, cross-reference Trade History for order types
  // (Cash Balance has no Order Type column; Trade History has it for every fill)
  const orderTypeMap = new Map<string, string>(); // key: `${symbol}-${date}`
  if (fillSource === 'cash-balance') {
    const tradeHistorySection = extractSection(
      content,
      'Account Trade History'
    );
    if (tradeHistorySection) {
      const historyFills = parseTradeHistoryFills(tradeHistorySection, errors);
      for (const fill of historyFills) {
        if (fill.action === 'BOT' && fill.orderType) {
          const key = `${fill.symbol}-${fill.date}`;
          if (!orderTypeMap.has(key)) orderTypeMap.set(key, fill.orderType);
        }
      }
    }
  }

  if (fills.length === 0 && errors.length === 0) {
    return {
      imported,
      skipped,
      errors: [
        'Could not find trade fills in Cash Balance or Account Trade History sections',
      ],
    };
  }

  // Position lifecycle tracking: accumulate fills until position returns to 0, then emit one Trade
  const positions = new Map<string, PositionAccum>();
  let unmatchedSells = 0;

  for (const fill of fills) {
    if (fill.action === 'BOT') {
      if (!positions.has(fill.symbol)) positions.set(fill.symbol, newAccum());
      const accum = positions.get(fill.symbol)!;

      if (accum.firstBuyDate === '') {
        accum.firstBuyDate = fill.date;
        accum.firstBuyTime = fill.time;
        accum.firstBuyRef = fill.refNum;
        accum.orderType =
          fill.orderType ||
          orderTypeMap.get(`${fill.symbol}-${fill.date}`) ||
          '';
      }
      accum.totalBuyQty += fill.quantity;
      accum.buySum += fill.price * fill.quantity;
      accum.totalBuyAmount += Math.abs(fill.amount);
      accum.totalBuyMiscFees += fill.miscFees;
      accum.totalBuyCommissions += fill.commissions;
    } else {
      // SOLD
      const accum = positions.get(fill.symbol);
      if (!accum || accum.totalBuyQty === 0) {
        unmatchedSells++;
        skipped++;
        continue;
      }

      if (accum.firstSellDate === null) {
        accum.firstSellDate = fill.date;
        accum.firstSellTime = fill.time;
      }
      accum.totalSellQty += fill.quantity;
      accum.sellSum += fill.price * fill.quantity;
      accum.totalSellAmount += fill.amount;
      accum.totalSellMiscFees += fill.miscFees;
      accum.totalSellCommissions += fill.commissions;
      if (fill.balance > 0) accum.lastBalance = fill.balance;

      // Position fully closed — emit one Trade and reset
      if (accum.totalSellQty >= accum.totalBuyQty) {
        const trade = emitTrade(fill.symbol, accum, fillSource);
        if (trade) {
          imported.push(trade);
        } else {
          errors.push(`${fill.symbol}: Failed to build trade from position`);
          skipped++;
        }
        positions.set(fill.symbol, newAccum());
      }
    }
  }

  // Any remaining open positions (buys with no matching sell in this file)
  let unmatchedBuys = 0;
  for (const [, accum] of positions) {
    if (accum.totalBuyQty > 0) unmatchedBuys++;
  }

  return { imported, skipped, errors, unmatchedBuys, unmatchedSells };
}
