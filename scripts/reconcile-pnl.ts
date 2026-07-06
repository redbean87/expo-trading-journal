#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

import Papa from 'papaparse';

import { parseTosAccountStatement } from '../src/utils/tos-import';

function parseAmount(val: string): number {
  if (!val || val.trim() === '') return 0;
  const cleaned = val
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .trim()
    .replace(/[()]/g, (m) => (m === '(' ? '-' : ''));
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseFee(val: string): number {
  if (!val || val.trim() === '' || val.trim() === '--') return 0;
  const cleaned = val.replace(/[$,()]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

type CbRow = {
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

function parseCashBalanceForTotal(content: string): {
  totalAmount: number;
  totalMiscFees: number;
  totalCommissions: number;
  startBalance: number;
  endBalance: number;
  trades: { desc: string; amount: number; fees: number; commissions: number }[];
} {
  const cashSection = extractSection(content, 'Cash Balance');
  if (!cashSection) {
    return {
      totalAmount: 0,
      totalMiscFees: 0,
      totalCommissions: 0,
      startBalance: 0,
      endBalance: 0,
      trades: [],
    };
  }

  let totalAmount = 0;
  let totalMiscFees = 0;
  let totalCommissions = 0;
  let startBalance = 0;
  let endBalance = 0;
  const trades: {
    desc: string;
    amount: number;
    fees: number;
    commissions: number;
  }[] = [];

  Papa.parse<CbRow>(cashSection, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      for (const row of results.data) {
        if (row.TYPE?.trim() === 'BAL') {
          const bal = parseAmount(row.BALANCE || '');
          if (row.DESCRIPTION?.includes('start of business')) {
            startBalance = bal;
          }
          endBalance = bal;
          continue;
        }
        if (row.TYPE?.trim() !== 'TRD') continue;

        const amt = parseAmount(row.AMOUNT || '');
        const fees = parseFee(row['Misc Fees']);
        const comm = parseFee(row['Commissions & Fees']);

        totalAmount += amt;
        totalMiscFees += fees;
        totalCommissions += comm;

        trades.push({
          desc: row.DESCRIPTION?.trim() || '',
          amount: amt,
          fees,
          commissions: comm,
        });
      }
    },
  });

  return {
    totalAmount,
    totalMiscFees,
    totalCommissions,
    startBalance,
    endBalance,
    trades,
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

function parseTotalLine(
  content: string
): { totalAmount: number; totalMiscFees: number } | null {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    if (line.includes('TOTAL')) {
      const parts = line.split(',');
      if (parts.length >= 9) {
        return {
          totalMiscFees: parseAmount(parts[5] || '0'),
          totalAmount: parseAmount(parts[7] || '0'),
        };
      }
    }
  }
  return null;
}

function parseGainLossCsv(content: string): {
  trades: {
    symbol: string;
    qty: number;
    gainLoss: number;
    washSale: boolean;
    disallowedLoss: number;
    totalTransactionGainLoss: number;
    proceeds: number;
    costBasis: number;
  }[];
  totalGainLoss: number;
  totalTransactionGainLoss: number;
} {
  const trades: {
    symbol: string;
    qty: number;
    gainLoss: number;
    washSale: boolean;
    disallowedLoss: number;
    totalTransactionGainLoss: number;
    proceeds: number;
    costBasis: number;
  }[] = [];

  // The GainLoss CSV has a metadata header on line 1 and real headers on line 2
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const csvBody = lines.slice(1).join('\n');

  Papa.parse<Record<string, string>>(csvBody, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      for (const row of results.data) {
        const symbol = (row['Symbol'] || '').trim();
        const qtyStr = (row['Quantity'] || '').trim();
        const gainLossStr = (row['Gain/Loss ($)'] || '')
          .replace(/[$,]/g, '')
          .trim();
        const washSale =
          (row['Wash Sale?'] || '').trim().toLowerCase() === 'yes';
        const disallowedStr = (row['Disallowed Loss'] || '')
          .replace(/[$,]/g, '')
          .trim();
        const totalGainStr = (row['Total Transaction Gain/Loss ($)'] || '')
          .replace(/[$,]/g, '')
          .trim();
        const proceedsStr = (row['Proceeds'] || '').replace(/[$,]/g, '').trim();
        const costBasisStr = (row['Cost Basis (CB)'] || '')
          .replace(/[$,]/g, '')
          .trim();

        if (!symbol || !qtyStr || !gainLossStr) continue;
        if (symbol === 'Symbol') continue;

        const qty = parseInt(qtyStr, 10);
        const gainLoss = parseFloat(gainLossStr);
        const disallowedLoss = disallowedStr ? parseFloat(disallowedStr) : 0;
        const totalTransactionGainLoss = totalGainStr
          ? parseFloat(totalGainStr)
          : 0;
        const proceeds = proceedsStr ? parseFloat(proceedsStr) : 0;
        const costBasis = costBasisStr ? parseFloat(costBasisStr) : 0;

        if (isNaN(qty) || isNaN(gainLoss)) continue;

        trades.push({
          symbol,
          qty,
          gainLoss,
          washSale,
          disallowedLoss,
          totalTransactionGainLoss,
          proceeds,
          costBasis,
        });
      }
    },
  });

  const totalGainLoss = trades.reduce((sum, t) => sum + t.gainLoss, 0);
  const totalTransactionGainLoss = trades.reduce(
    (sum, t) =>
      sum +
      (t.totalTransactionGainLoss !== 0
        ? t.totalTransactionGainLoss
        : t.gainLoss),
    0
  );

  return { trades, totalGainLoss, totalTransactionGainLoss };
}

function main() {
  const args = process.argv.slice(2);
  const accountStatementPath =
    args[0] || 'assets/sample/2026-07-06-AccountStatement-fb.csv';
  const gainLossPath =
    args[1] ||
    'assets/sample/XXXX9299_GainLoss_Realized_Details_20260706-104711.csv';

  const accountStatementFile = path.resolve(accountStatementPath);
  const gainLossFile = path.resolve(gainLossPath);

  console.log('='.repeat(80));
  console.log('  P/L RECONCILIATION REPORT');
  console.log('='.repeat(80));

  // --- Part 1: Account Statement Analysis ---
  console.log('\n' + '-'.repeat(80));
  console.log('  PART 1: ACCOUNT STATEMENT (Thinkorswim / Schwab)');
  console.log('-'.repeat(80));

  const asContent = fs.readFileSync(accountStatementFile, 'utf-8');
  const asTotal = parseTotalLine(asContent);
  const cbBreakdown = parseCashBalanceForTotal(asContent);

  console.log(`\n  File: ${accountStatementFile}`);
  console.log(`  Starting Balance: $${cbBreakdown.startBalance.toFixed(2)}`);
  console.log(`  Ending Balance:   $${cbBreakdown.endBalance.toFixed(2)}`);
  console.log(
    `  Net Change:       $${(cbBreakdown.endBalance - cbBreakdown.startBalance).toFixed(2)}`
  );
  console.log('');
  if (asTotal) {
    console.log(
      `  ┌─────────────────────────────────────────────────────────────┐`
    );
    console.log(
      `  │  STATEMENT TOTAL LINE (Cash Balance section)              │`
    );
    console.log(
      `  │  ───────────────────────────┬────────────────────────────── │`
    );
    console.log(
      `  │  Raw Trade P&L (AMOUNT sum) │  $${String(asTotal.totalAmount).padStart(12)} │`
    );
    console.log(
      `  │  Misc Fees                  │  $${String(asTotal.totalMiscFees).padStart(12)} │`
    );
    console.log(
      `  │  ───────────────────────────┼────────────────────────────── │`
    );
    console.log(
      `  │  NET TOTAL                  │  $${String((asTotal.totalAmount + asTotal.totalMiscFees).toFixed(2)).padStart(12)} │`
    );
    console.log(
      `  │  (Your spreadsheet number)  │                              │`
    );
    console.log(
      `  └─────────────────────────────┴───────────────────────────────┘`
    );
  }

  console.log(
    `\n  --- Raw Fill Breakdown (${cbBreakdown.trades.length} fills) ---`
  );
  let buySum = 0;
  let sellSum = 0;
  let feeSum = 0;
  let commSum = 0;
  for (const t of cbBreakdown.trades) {
    const isBuy = t.desc.startsWith('BOT');
    const isSell = t.desc.startsWith('SOLD');
    const label = isBuy ? 'BUY ' : isSell ? 'SELL' : '    ';
    if (isBuy) buySum += Math.abs(t.amount);
    if (isSell) sellSum += t.amount;
    feeSum += t.fees;
    commSum += t.commissions;
    console.log(
      `  ${label}  ${t.desc.padEnd(45)}  $${t.amount.toFixed(2).padStart(10)}  fees:$${t.fees.toFixed(2)}  comm:$${t.commissions.toFixed(2)}`
    );
  }
  console.log(`  ${''.padEnd(47)}  ────────────`);
  console.log(
    `  ${'TOTALS'.padEnd(47)}  buys:$${buySum.toFixed(2).padStart(8)}  sells:$${sellSum.toFixed(2).padStart(8)}  fees:$${feeSum.toFixed(2)}  comm:$${commSum.toFixed(2)}`
  );
  console.log(
    `  ${'Net (sells - buys)'.padEnd(47)}  $${(sellSum - buySum).toFixed(2)}`
  );
  console.log(
    `  ${'Net + fees'.padEnd(47)}  $${(sellSum - buySum - feeSum - commSum).toFixed(2)}`
  );

  // --- Part 2: App Import Simulation ---
  console.log('\n' + '-'.repeat(80));
  console.log('  PART 2: APP TRADE IMPORT SIMULATION');
  console.log('-'.repeat(80));

  const result = parseTosAccountStatement(asContent);

  console.log(`\n  Imported ${result.imported.length} trades`);
  console.log(`  Skipped: ${result.skipped}`);
  if (result.unmatchedBuys)
    console.log(`  Unmatched buys: ${result.unmatchedBuys}`);
  if (result.unmatchedSells)
    console.log(`  Unmatched sells: ${result.unmatchedSells}`);
  if (result.errors.length > 0) {
    console.log(`  Errors: ${result.errors.length}`);
    for (const e of result.errors) console.log(`    ⚠ ${e}`);
  }

  let appTotalPnl = 0;
  let appTotalFees = 0;
  let appTotalCommissions = 0;

  console.log(`\n  --- Per-Trade Breakdown ---`);
  for (const trade of result.imported) {
    const pnl = trade.pnl;
    const pnlPct = trade.pnlPercent;
    const fees = trade.fees || 0;
    const commissions = trade.commissions || 0;
    appTotalPnl += pnl;
    appTotalFees += fees;
    appTotalCommissions += commissions;

    const entryStr =
      trade.entryTime instanceof Date
        ? trade.entryTime.toLocaleDateString('en-US')
        : '?';
    const exitStr =
      trade.exitTime instanceof Date
        ? trade.exitTime.toLocaleDateString('en-US')
        : '?';

    console.log(
      `  ${trade.symbol.padEnd(6)} ${'long'.padEnd(4)} qty:${String(trade.quantity).padStart(4)} ` +
        `entry:$${trade.entryPrice.toFixed(4).padStart(8)} exit:$${trade.exitPrice.toFixed(4).padStart(8)} ` +
        `fees:$${fees.toFixed(2)} comm:$${commissions.toFixed(2)} ` +
        `P&L: $${pnl.toFixed(2).padStart(8)} (${pnlPct.toFixed(2)}%) ` +
        `[${entryStr} → ${exitStr}] ` +
        `src:${trade.importedFrom}`
    );
  }

  console.log(
    `\n  ┌─────────────────────────────────────────────────────────────────────┐`
  );
  console.log(
    `  │  APP TOTALS                                                        │`
  );
  console.log(
    `  │  ──────────────────────────────────┬──────────────────────────────── │`
  );
  console.log(
    `  │  Sum of trade P&L                  │  $${String(appTotalPnl.toFixed(2)).padStart(14)} │`
  );
  console.log(
    `  │  Sum of fees                       │  $${String(appTotalFees.toFixed(2)).padStart(14)} │`
  );
  console.log(
    `  │  Sum of commissions                │  $${String(appTotalCommissions.toFixed(2)).padStart(14)} │`
  );
  console.log(
    `  │  Trades count                      │  ${String(result.imported.length).padStart(14)} │`
  );
  console.log(
    `  └────────────────────────────────────┴─────────────────────────────────┘`
  );

  // --- Comparison: App vs Statement ---
  console.log('\n' + '-'.repeat(80));
  console.log('  PART 3: RECONCILIATION');
  console.log('-'.repeat(80));

  const statementNet = asTotal
    ? asTotal.totalAmount + asTotal.totalMiscFees
    : 0;

  console.log(
    `\n  ┌─────────────────────────────────────────────────────────────────────────┐`
  );
  console.log(
    `  │  Source               │  Value        │  vs Statement  │  vs App        │`
  );
  console.log(
    `  │  ─────────────────────┼───────────────┼────────────────┼──────────────── │`
  );
  console.log(
    `  │  Statement TOTAL      │  $${String(statementNet.toFixed(2)).padStart(10)}  │  —             │                │`
  );
  console.log(
    `  │  App (imported)       │  $${String(appTotalPnl.toFixed(2)).padStart(10)}  │  $${String((appTotalPnl - statementNet).toFixed(2)).padStart(10)}     │  —             │`
  );
  console.log(
    `  │  Schwab GainLoss      │  see Part 4   │                │                │`
  );
  console.log(
    `  └─────────────────────────────────────────────────────────────────────────┘`
  );

  if (Math.abs(appTotalPnl - statementNet) > 0.05) {
    console.log(
      `\n  ⚠ DISCREPANCY: App ($${appTotalPnl.toFixed(2)}) differs from Statement ($${statementNet.toFixed(2)})`
    );
    console.log(`    Difference: $${(appTotalPnl - statementNet).toFixed(2)}`);

    const cbNet = sellSum - buySum - feeSum - commSum;
    console.log(
      `\n  Manual CB calc: sells($${sellSum.toFixed(2)}) - buys($${buySum.toFixed(2)}) - fees($${feeSum.toFixed(2)}) - comm($${commSum.toFixed(2)}) = $${cbNet.toFixed(2)}`
    );
    console.log(`  Statement TOTAL line: $${statementNet.toFixed(2)}`);

    if (Math.abs(cbNet - statementNet) > 0.01) {
      console.log(
        `\n  ⚠ INTERNAL MISMATCH: Manual CB calc ($${cbNet.toFixed(2)}) != Statement TOTAL ($${statementNet.toFixed(2)})`
      );
    }
  } else {
    console.log(`\n  ✅ App total matches Statement total (within rounding)`);
  }

  // --- Part 4: Schwab GainLoss Report ---
  console.log('\n' + '-'.repeat(80));
  console.log('  PART 4: SCHWAB GAINLOSS REPORT (Realized Details)');
  console.log('-'.repeat(80));

  const glContent = fs.readFileSync(gainLossFile, 'utf-8');
  const glData = parseGainLossCsv(glContent);

  console.log(`\n  File: ${gainLossFile}`);
  console.log(`  Total trades/lots: ${glData.trades.length}`);
  console.log('');

  let glStandardTotal = 0;
  let glTransactionTotal = 0;
  let washCount = 0;

  console.log(`  --- Lot-by-Lot Breakdown ---`);
  for (const t of glData.trades) {
    glStandardTotal += t.gainLoss;
    glTransactionTotal +=
      t.totalTransactionGainLoss !== 0
        ? t.totalTransactionGainLoss
        : t.gainLoss;
    if (t.washSale) washCount++;

    const ws = t.washSale
      ? ` [WASH SALE] disallowed:$${t.disallowedLoss.toFixed(2)}`
      : '';
    const txGl =
      t.totalTransactionGainLoss !== 0
        ? ` txGl:$${t.totalTransactionGainLoss.toFixed(2)}`
        : '';
    console.log(
      `  ${t.symbol.padEnd(6)} qty:${String(t.qty).padStart(4)} gain/loss: $${t.gainLoss.toFixed(2).padStart(8)}${txGl}${ws}`
    );
  }

  console.log(
    `\n  ┌─────────────────────────────────────────────────────────────────┐`
  );
  console.log(
    `  │  SCHWAB GAINLOSS TOTALS                                        │`
  );
  console.log(
    `  │  ─────────────────────────────────┬──────────────────────────── │`
  );
  console.log(
    `  │  Standard Gain/Loss ($)           │  $${String(glStandardTotal.toFixed(2)).padStart(12)} │`
  );
  console.log(
    `  │  Total Trans. Gain/Loss ($)       │  $${String(glTransactionTotal.toFixed(2)).padStart(12)} │`
  );
  console.log(
    `  │  Wash sale lots                   │  ${String(washCount).padStart(12)} │`
  );
  console.log(
    `  └───────────────────────────────────┴──────────────────────────────┘`
  );

  // --- Part 5: Symbol-level comparison ---
  console.log('\n' + '-'.repeat(80));
  console.log('  PART 5: SYMBOL-LEVEL COMPARISON (App vs Schwab GainLoss)');
  console.log('-'.repeat(80));

  const appBySymbol = new Map<string, number>();
  for (const trade of result.imported) {
    const current = appBySymbol.get(trade.symbol) || 0;
    appBySymbol.set(trade.symbol, current + trade.pnl);
  }

  const glBySymbol = new Map<string, number>();
  for (const t of glData.trades) {
    const val =
      t.totalTransactionGainLoss !== 0
        ? t.totalTransactionGainLoss
        : t.gainLoss;
    const current = glBySymbol.get(t.symbol) || 0;
    glBySymbol.set(t.symbol, current + val);
  }

  const allSymbols = new Set([...appBySymbol.keys(), ...glBySymbol.keys()]);
  console.log(`\n  Symbol     App P&L      Schwab GL    Difference`);
  console.log(`  ───────   ──────────   ──────────   ──────────`);
  for (const sym of [...allSymbols].sort()) {
    const appPnl = appBySymbol.get(sym) || 0;
    const glPnl = glBySymbol.get(sym) || 0;
    const diff = appPnl - glPnl;
    console.log(
      `  ${sym.padEnd(8)} $${appPnl.toFixed(2).padStart(9)} $${glPnl.toFixed(2).padStart(9)} $${diff.toFixed(2).padStart(9)}`
    );
  }

  // Add total row
  const totalApp = [...appBySymbol.values()].reduce((a, b) => a + b, 0);
  const totalGl = [...glBySymbol.values()].reduce((a, b) => a + b, 0);
  console.log(`  ───────   ──────────   ──────────   ──────────`);
  console.log(
    `  ${'TOTAL'.padEnd(8)} $${totalApp.toFixed(2).padStart(9)} $${totalGl.toFixed(2).padStart(9)} $${(totalApp - totalGl).toFixed(2).padStart(9)}`
  );

  // --- Part 6: Fee Analysis ---
  console.log('\n' + '-'.repeat(80));
  console.log('  PART 6: FEE ANALYSIS');
  console.log('-'.repeat(80));

  // Report total fees from statement
  console.log(`\n  Statement Misc Fees total:  $${feeSum.toFixed(2)}`);
  console.log(`  Statement Commission total: $${commSum.toFixed(2)}`);
  console.log(`  App total fees:             $${appTotalFees.toFixed(2)}`);
  console.log(
    `  App total commissions:      $${appTotalCommissions.toFixed(2)}`
  );
  const appTotalAllFees = appTotalFees + appTotalCommissions;
  const statementTotalAllFees = feeSum + commSum;
  console.log(`  App all fees combined:      $${appTotalAllFees.toFixed(2)}`);
  console.log(
    `  Statement all fees combined: $${statementTotalAllFees.toFixed(2)}`
  );
  if (Math.abs(appTotalAllFees - statementTotalAllFees) > 0.01) {
    console.log(
      `  ⚠ Fee mismatch: App=$${appTotalAllFees.toFixed(2)} vs Statement=$${statementTotalAllFees.toFixed(2)}`
    );
  } else {
    console.log(`  ✅ Fees match`);
  }

  // --- Summary ---
  console.log('\n' + '='.repeat(80));
  console.log('  SUMMARY');
  console.log('='.repeat(80));

  console.log(
    `\n  Source                          P&L        Fees       Total`
  );
  console.log(
    `  ────────────────────────────   ─────────  ─────────  ─────────`
  );
  console.log(
    `  Account Statement TOTAL        $${(asTotal?.totalAmount || 0).toFixed(2).padStart(8)}  $${(asTotal?.totalMiscFees || 0).toFixed(2).padStart(8)}  $${statementNet.toFixed(2).padStart(8)}`
  );
  console.log(
    `  App (your imported trades)     $${appTotalPnl.toFixed(2).padStart(8)}  $${(appTotalFees + appTotalCommissions).toFixed(2).padStart(8)}  $${appTotalPnl.toFixed(2).padStart(8)}`
  );
  const diff = appTotalPnl - statementNet;
  console.log(
    `  ────────────────────────────   ─────────  ─────────  ─────────`
  );
  console.log(
    `  GAP (App - Statement)                          $${diff.toFixed(2).padStart(8)}`
  );
  console.log(
    `  Schwab GainLoss (standard)     $${glStandardTotal.toFixed(2).padStart(8)}`
  );
  console.log(
    `  Schwab GainLoss (tx-adjusted)  $${glTransactionTotal.toFixed(2).padStart(8)}`
  );
  console.log(
    `  Your spreadsheet               $${statementNet.toFixed(2).padStart(8)}`
  );

  console.log('\n');
}

main();
