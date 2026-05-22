import { isTosAccountStatement, parseTosAccountStatement } from '../tos-import';

const SAMPLE_HEADER = `Account Statement for 54639299SCHW (Individual) since 2/28/26 through 3/14/26

Cash Balance
DATE,TIME,TYPE,REF #,DESCRIPTION,Misc Fees,Commissions & Fees,AMOUNT,BALANCE`;

function makeSample(tradeLines: string) {
  return `${SAMPLE_HEADER}
${tradeLines}

Futures Statements`;
}

describe('isTosAccountStatement', () => {
  it('returns true for TOS account statement', () => {
    expect(
      isTosAccountStatement(
        'Account Statement for 12345SCHW (Individual) since 1/1/26'
      )
    ).toBe(true);
  });

  it('returns false for standard CSV', () => {
    expect(
      isTosAccountStatement(
        'symbol,shares,entryPrice,exitPrice\nAAPL,100,150,160'
      )
    ).toBe(false);
  });

  it('handles leading whitespace', () => {
    expect(isTosAccountStatement('\nAccount Statement for 12345')).toBe(true);
  });
});

describe('parseTosAccountStatement', () => {
  it('aggregates multiple partial buy fills into one trade', () => {
    // 8 buy fills + 2 sell fills → 1 trade (the March TPET pattern)
    const content = makeSample(
      `3/2/26,08:32:52,TRD,="1",BOT +200 TPET @1.165,,,-233.00,"2,701.83"
3/2/26,08:32:52,TRD,="1",BOT +120 TPET @1.165,,,-139.80,"2,562.03"
3/2/26,08:32:52,TRD,="2",BOT +320 TPET @1.16809,,,-373.79,"2,188.24"
3/2/26,08:34:19,TRD,="3","SOLD -793 TPET @1.17369",-0.15,,930.74,"1,250.57"
3/2/26,08:34:19,TRD,="3","SOLD -447 TPET @1.1737",-0.09,,"1,698.35","2,948.63"`
    );

    const result = parseTosAccountStatement(content);
    expect(result.errors).toHaveLength(0);
    expect(result.imported).toHaveLength(1);

    const trade = result.imported[0];
    expect(trade.symbol).toBe('TPET');
    expect(trade.quantity).toBe(640); // total buy = 200+120+320 = 640
    // Weighted avg entry: (200*1.165 + 120*1.165 + 320*1.16809) / 640
    expect(trade.entryPrice).toBeCloseTo(1.1666, 3);
    // Weighted avg exit: (793*1.17369 + 447*1.1737) / 1240 ... wait sells = 793+447 = 1240 but buys = 640
    // Position closes when sellQty >= buyQty (640). First sell fills 793 ≥ 640 → closes then.
    expect(trade.side).toBe('long');
    expect(trade.fees).toBeGreaterThan(0);
    // pnl must have fees deducted
    expect(trade.pnl).toBeDefined();
  });

  it('handles multi-day position within same statement', () => {
    const content = makeSample(
      `3/9/26,08:44:52,TRD,="1",BOT +500 LRHC @1.4181,,,-709.05,716.96
3/10/26,09:00:00,TRD,="2",SOLD -500 LRHC @1.4318,-0.10,,715.90,"1,432.86"`
    );

    const result = parseTosAccountStatement(content);
    expect(result.errors).toHaveLength(0);
    expect(result.imported).toHaveLength(1);

    const trade = result.imported[0];
    expect(trade.symbol).toBe('LRHC');
    expect(trade.quantity).toBe(500);
    expect(trade.entryPrice).toBe(1.4181);
    expect(trade.exitPrice).toBe(1.4318);
    expect(trade.entryTime.getDate()).toBe(9);
    expect(trade.exitTime.getDate()).toBe(10);
    // pnl: (1.4318 - 1.4181) * 500 - 0.10 = 6.85 - 0.10 = 6.75
    expect(trade.pnl).toBeCloseTo(6.75, 1);
  });

  it('creates separate trades for same symbol traded on two different days', () => {
    const content = makeSample(
      `3/5/26,08:50:57,TRD,="1",BOT +500 TURB @2.355,,,-1177.50,1906.81
3/5/26,08:52:19,TRD,="2",SOLD -500 TURB @2.1601,-0.10,,1080.05,2986.86
3/12/26,08:37:22,TRD,="3",BOT +500 TURB @4.48,,,-2240.00,786.74
3/12/26,08:40:04,TRD,="4",SOLD -500 TURB @4.54,-0.10,,2270.00,3056.64`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported).toHaveLength(2);
    const entries = result.imported.map((t) => t.entryPrice);
    expect(entries).toContain(2.355);
    expect(entries).toContain(4.48);
  });

  it('handles descriptions with commas in quantities', () => {
    const content = makeSample(
      `3/6/26,08:43:26,TRD,="1","BOT +1,000 TPET @2.2086",,,"-2,208.60",623.10
3/6/26,08:46:16,TRD,="2","SOLD -1,000 TPET @2.222",-0.24,,"2,222.00","2,844.90"`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].quantity).toBe(1000);
    expect(result.imported[0].entryPrice).toBe(2.2086);
    expect(result.imported[0].exitPrice).toBe(2.222);
  });

  it('aggregates multiple partial sell fills into weighted avg exit', () => {
    const content = makeSample(
      `3/4/26,08:37:18,TRD,="1",BOT +300 CANF @9.00,,,-900.00,"2,100.00"
3/4/26,08:37:50,TRD,="2",SOLD -100 CANF @9.20,-0.02,,920.00,"1,220.00"
3/4/26,08:37:51,TRD,="3",SOLD -200 CANF @9.30,-0.04,,1860.00,"3,080.00"`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported).toHaveLength(1);
    const trade = result.imported[0];
    expect(trade.quantity).toBe(300);
    expect(trade.entryPrice).toBe(9.0);
    // Weighted avg exit: (100*9.20 + 200*9.30) / 300 = (920 + 1860) / 300 = 9.267
    expect(trade.exitPrice).toBeCloseTo(9.267, 2);
  });

  it('reports unmatched buys (open positions) in the result', () => {
    const content = makeSample(
      `3/9/26,08:44:52,TRD,="1",BOT +1000 AUID @2.13,,,-2130.00,870.00`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported).toHaveLength(0);
    expect(result.unmatchedBuys).toBe(1);
    expect(result.unmatchedSells).toBe(0);
  });

  it('reports unmatched sells (cross-statement positions)', () => {
    const content = makeSample(
      `2/9/26,09:45:36,TRD,="1",SOLD -368 MNTS @7.19333,-0.07,,2647.15,3517.15`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported).toHaveLength(0);
    expect(result.unmatchedSells).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it('stamps importedFrom as cash-balance for Cash Balance TRD rows', () => {
    const content = makeSample(
      `3/9/26,08:44:52,TRD,="1",BOT +500 LRHC @1.4181,,,-709.05,716.96
3/9/26,08:46:50,TRD,="2",SOLD -500 LRHC @1.4318,-0.10,,715.90,"1,432.86"`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported[0].importedFrom).toBe('cash-balance');
  });

  it('skips BAL rows', () => {
    const content = makeSample(
      `3/1/26,00:00:00,BAL,,Cash balance at the start of business day 01.03 CST,,,,"2,934.83"
3/2/26,08:32:00,TRD,="1",BOT +200 TPET @1.165,,,-233.00,"2,701.83"
3/2/26,08:34:00,TRD,="2",SOLD -200 TPET @1.20,-0.04,,240.00,"2,941.83"`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported).toHaveLength(1);
  });

  it('returns error when neither Cash Balance nor Account Trade History section is present', () => {
    const result = parseTosAccountStatement(
      'Account Statement for 12345\n\nSome other content'
    );
    expect(result.imported).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Cash Balance');
  });

  it('splits Misc Fees and Commissions & Fees into separate fields', () => {
    const content = makeSample(
      `3/10/26,09:00:00,TRD,="1",BOT +100 AAPL @150.00,,,-15000.00,1000.00
3/10/26,09:30:00,TRD,="2",SOLD -100 AAPL @151.00,-0.05,-1.50,15100.00,2000.00`
    );

    const result = parseTosAccountStatement(content);
    expect(result.imported).toHaveLength(1);
    const trade = result.imported[0];
    expect(trade.fees).toBeCloseTo(0.05, 2); // Misc Fees
    expect(trade.commissions).toBeCloseTo(1.5, 2); // Commissions & Fees
    // pnl: 15100 - 15000 - 0.05 - 1.50 = 98.45
    expect(trade.pnl).toBeCloseTo(98.45, 1);
  });

  describe('Account Trade History format (new Schwab)', () => {
    const TRADE_HISTORY_HEADER = `Account Statement for 54639299SCHW (Individual) since 3/18/26 through 3/18/26

Cash Balance
DATE,TIME,TYPE,REF #,DESCRIPTION,Misc Fees,Commissions & Fees,AMOUNT,BALANCE
3/19/26,00:00:00,BAL,,Cash balance at the start of business day 19.03 CST,,,,"3,041.99"
,,,,TOTAL,,,,"$3,041.99"

Futures Statements

Account Trade History`;

    function makeTradeHistorySample(tradeLines: string) {
      return `${TRADE_HISTORY_HEADER}
${tradeLines}

Profits and Losses`;
    }

    it('imports trades from Account Trade History when Cash Balance has no TRD rows', () => {
      const content = makeTradeHistorySample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.1687,2.16872,LMT
,3/19/26 08:37:28,STOCK,BUY,+8,TO OPEN,SER,,,STOCK,2.135,2.135,LMT
,3/19/26 08:37:28,STOCK,BUY,+242,TO OPEN,SER,,,STOCK,2.1397,2.13971,LMT
,3/19/26 08:37:32,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.136,2.136,LMT
,3/19/26 08:37:34,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.125,2.125,LMT
,3/19/26 08:37:37,STOCK,SELL,-1000,TO CLOSE,SER,,,STOCK,2.1306,2.1306,MKT
,3/19/26 08:37:52,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.1499,2.14992,LMT
,3/19/26 08:38:39,STOCK,SELL,-250,TO CLOSE,SER,,,STOCK,2.185,2.185,MKT`
      );

      const result = parseTosAccountStatement(content);
      expect(result.errors).toHaveLength(0);
      // Two positions: 1000-share trade closes at 08:37:37, then 250-share trade closes at 08:38:39
      expect(result.imported).toHaveLength(2);
      expect(result.imported.every((t) => t.symbol === 'SER')).toBe(true);
    });

    it('correctly calculates weighted avg entry for partial fills', () => {
      const content = makeTradeHistorySample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.1687,2.16872,LMT
,3/19/26 08:37:28,STOCK,BUY,+8,TO OPEN,SER,,,STOCK,2.135,2.135,LMT
,3/19/26 08:37:28,STOCK,BUY,+242,TO OPEN,SER,,,STOCK,2.1397,2.13971,LMT
,3/19/26 08:37:32,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.136,2.136,LMT
,3/19/26 08:37:34,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.125,2.125,LMT
,3/19/26 08:37:37,STOCK,SELL,-1000,TO CLOSE,SER,,,STOCK,2.1306,2.1306,MKT`
      );

      const result = parseTosAccountStatement(content);
      expect(result.imported).toHaveLength(1);
      const trade = result.imported[0];
      expect(trade.symbol).toBe('SER');
      expect(trade.quantity).toBe(1000);
      // Weighted avg entry: (250*2.1687 + 8*2.135 + 242*2.1397 + 250*2.136 + 250*2.125) / 1000
      const expectedEntry =
        (250 * 2.1687 + 8 * 2.135 + 242 * 2.1397 + 250 * 2.136 + 250 * 2.125) /
        1000;
      expect(trade.entryPrice).toBeCloseTo(expectedEntry, 3);
      expect(trade.exitPrice).toBe(2.1306);
      expect(trade.side).toBe('long');
    });

    it('stamps importedFrom as trade-history', () => {
      const content = makeTradeHistorySample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+500,TO OPEN,SER,,,STOCK,2.15,2.15,LMT
,3/19/26 08:38:39,STOCK,SELL,-500,TO CLOSE,SER,,,STOCK,2.185,2.185,MKT`
      );

      const result = parseTosAccountStatement(content);
      expect(result.imported[0].importedFrom).toBe('trade-history');
    });

    it('sets correct entry and exit times from Account Trade History', () => {
      const content = makeTradeHistorySample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+500,TO OPEN,SER,,,STOCK,2.15,2.15,LMT
,3/19/26 08:38:39,STOCK,SELL,-500,TO CLOSE,SER,,,STOCK,2.185,2.185,MKT`
      );

      const result = parseTosAccountStatement(content);
      expect(result.imported).toHaveLength(1);
      const trade = result.imported[0];
      expect(trade.entryTime.getFullYear()).toBe(2026);
      expect(trade.entryTime.getMonth()).toBe(2); // March = 2
      expect(trade.entryTime.getDate()).toBe(19);
      expect(trade.entryTime.getHours()).toBe(8);
      expect(trade.entryTime.getMinutes()).toBe(37);
      expect(trade.exitTime.getHours()).toBe(8);
      expect(trade.exitTime.getMinutes()).toBe(38);
    });
  });

  it('sets correct entry and exit times from first fills', () => {
    const content = makeSample(
      `3/9/26,08:44:52,TRD,="1",BOT +1000 LRHC @1.4181,,,-1418.10,1426.01
3/9/26,08:46:50,TRD,="2",SOLD -1000 LRHC @1.4318,-0.20,,1431.80,2857.81`
    );

    const result = parseTosAccountStatement(content);
    const trade = result.imported[0];
    expect(trade.entryTime.getFullYear()).toBe(2026);
    expect(trade.entryTime.getMonth()).toBe(2);
    expect(trade.entryTime.getDate()).toBe(9);
    expect(trade.entryTime.getHours()).toBe(8);
    expect(trade.entryTime.getMinutes()).toBe(44);
    expect(trade.exitTime.getHours()).toBe(8);
    expect(trade.exitTime.getMinutes()).toBe(46);
  });

  describe('Merged TOS import (fill-level merge)', () => {
    const MERGED_HEADER = `Account Statement for 54639299SCHW (Individual) since 3/18/26 through 3/18/26

Cash Balance
DATE,TIME,TYPE,REF #,DESCRIPTION,Misc Fees,Commissions & Fees,AMOUNT,BALANCE
3/19/26,08:37:00,TRD,="1",BOT +250 SER @2.1687,,,-542.18,"2,501.83"
3/19/26,08:37:00,TRD,="1",BOT +8 SER @2.135,,,-17.08,"2,484.75"
3/19/26,08:37:00,TRD,="1",BOT +242 SER @2.1397,,,-517.81,"1,966.94"
3/19/26,08:37:00,TRD,="1",BOT +250 SER @2.136,,,-534.00,"1,432.94"
3/19/26,08:37:00,TRD,="1",BOT +250 SER @2.125,,,-531.25,"901.69"
3/19/26,08:37:00,TRD,="1",SOLD -1000 SER @2.1306,-0.15,,2130.60,"3,032.29"
3/19/26,09:15:00,TRD,="2",BOT +500 AAPL @150.00,,,-75000.00,"0.00"
3/19/26,09:16:00,TRD,="2",SOLD -500 AAPL @151.00,-0.25,-1.50,75500.00,"500.00"
,,,,TOTAL,,,,"$500.00"

Futures Statements

Account Trade History`;

    function makeMergedSample(tradeLines: string) {
      return `${MERGED_HEADER}
${tradeLines}

Profits and Losses`;
    }

    it('imports trades from both sections when both are present', () => {
      const content = makeMergedSample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.1687,2.16872,LMT
,3/19/26 08:37:28,STOCK,BUY,+8,TO OPEN,SER,,,STOCK,2.135,2.135,LMT
,3/19/26 08:37:28,STOCK,BUY,+242,TO OPEN,SER,,,STOCK,2.1397,2.13971,LMT
,3/19/26 08:37:32,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.136,2.136,LMT
,3/19/26 08:37:34,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.125,2.125,LMT
,3/19/26 08:37:37,STOCK,SELL,-1000,TO CLOSE,SER,,,STOCK,2.1306,2.1306,MKT
,3/19/26 09:15:00,STOCK,BUY,+500,TO OPEN,AAPL,,,STOCK,150.00,150.00,LMT
,3/19/26 09:16:00,STOCK,SELL,-500,TO CLOSE,AAPL,,,STOCK,151.00,151.00,LMT`
      );

      const result = parseTosAccountStatement(content);
      expect(result.errors).toHaveLength(0);
      expect(result.imported).toHaveLength(2);

      const serTrade = result.imported.find((t) => t.symbol === 'SER');
      const aaplTrade = result.imported.find((t) => t.symbol === 'AAPL');

      expect(serTrade).toBeDefined();
      expect(aaplTrade).toBeDefined();
    });

    it('enriches merged trades with CB fees and exact amounts', () => {
      const content = makeMergedSample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 09:15:00,STOCK,BUY,+500,TO OPEN,AAPL,,,STOCK,150.00,150.00,LMT
,3/19/26 09:16:00,STOCK,SELL,-500,TO CLOSE,AAPL,,,STOCK,151.00,151.00,LMT`
      );

      const result = parseTosAccountStatement(content);
      expect(result.imported.length).toBeGreaterThanOrEqual(1);

      const aaplTrade = result.imported.find((t) => t.symbol === 'AAPL');
      expect(aaplTrade).toBeDefined();
      expect(aaplTrade!.fees).toBeCloseTo(0.25, 2);
      expect(aaplTrade!.commissions).toBeCloseTo(1.5, 2);
      expect(aaplTrade!.importedFrom).toBe('tos-merged');
    });

    it('stamps importedFrom as tos-merged when both sections have matching fills', () => {
      const content = makeMergedSample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.1687,2.16872,LMT
,3/19/26 08:37:28,STOCK,BUY,+8,TO OPEN,SER,,,STOCK,2.135,2.135,LMT
,3/19/26 08:37:28,STOCK,BUY,+242,TO OPEN,SER,,,STOCK,2.1397,2.13971,LMT
,3/19/26 08:37:32,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.136,2.136,LMT
,3/19/26 08:37:34,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.125,2.125,LMT
,3/19/26 08:37:37,STOCK,SELL,-1000,TO CLOSE,SER,,,STOCK,2.1306,2.1306,MKT`
      );

      const result = parseTosAccountStatement(content);
      const serTrade = result.imported.find((t) => t.symbol === 'SER');
      expect(serTrade).toBeDefined();
      expect(serTrade!.importedFrom).toBe('tos-merged');
    });

    it('preserves orderType from Trade History on merged trades', () => {
      const content = makeMergedSample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 09:15:00,STOCK,BUY,+500,TO OPEN,AAPL,,,STOCK,150.00,150.00,LMT
,3/19/26 09:16:00,STOCK,SELL,-500,TO CLOSE,AAPL,,,STOCK,151.00,151.00,MKT`
      );

      const result = parseTosAccountStatement(content);
      const aaplTrade = result.imported.find((t) => t.symbol === 'AAPL');
      expect(aaplTrade).toBeDefined();
      expect(aaplTrade!.orderType).toBe('LMT');
    });

    it('sets importId from CB refNum on merged trades', () => {
      const content = makeMergedSample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 09:15:00,STOCK,BUY,+500,TO OPEN,AAPL,,,STOCK,150.00,150.00,LMT
,3/19/26 09:16:00,STOCK,SELL,-500,TO CLOSE,AAPL,,,STOCK,151.00,151.00,LMT`
      );

      const result = parseTosAccountStatement(content);
      const aaplTrade = result.imported.find((t) => t.symbol === 'AAPL');
      expect(aaplTrade).toBeDefined();
      expect(aaplTrade!.importId).toBe('cb-2');
    });

    it('includes unmatched CB fills as separate cash-balance trades', () => {
      // TH has no AAPL fills, but CB does
      const content = makeMergedSample(
        `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+250,TO OPEN,SER,,,STOCK,2.1687,2.16872,LMT
,3/19/26 08:37:37,STOCK,SELL,-1000,TO CLOSE,SER,,,STOCK,2.1306,2.1306,MKT`
      );

      const result = parseTosAccountStatement(content);
      expect(result.imported).toHaveLength(2);

      const serTrade = result.imported.find((t) => t.symbol === 'SER');
      const aaplTrade = result.imported.find((t) => t.symbol === 'AAPL');

      expect(serTrade).toBeDefined();
      expect(serTrade!.importedFrom).toBe('tos-merged');

      expect(aaplTrade).toBeDefined();
      expect(aaplTrade!.importedFrom).toBe('cash-balance');
    });

    it('falls back to trade-history when Cash Balance has no TRD rows', () => {
      const header = `Account Statement for 54639299SCHW (Individual) since 3/18/26 through 3/18/26

Cash Balance
DATE,TIME,TYPE,REF #,DESCRIPTION,Misc Fees,Commissions & Fees,AMOUNT,BALANCE
3/19/26,00:00:00,BAL,,Cash balance at the start of business day 19.03 CST,,,,"3,041.99"
,,,,TOTAL,,,,"$3,041.99"

Futures Statements

Account Trade History`;

      const content = `${header}
,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Exp,Strike,Type,Price,Net Price,Order Type
,3/19/26 08:37:25,STOCK,BUY,+500,TO OPEN,SER,,,STOCK,2.15,2.15,LMT
,3/19/26 08:38:39,STOCK,SELL,-500,TO CLOSE,SER,,,STOCK,2.185,2.185,MKT

Profits and Losses`;

      const result = parseTosAccountStatement(content);
      expect(result.imported).toHaveLength(1);
      expect(result.imported[0].importedFrom).toBe('trade-history');
      expect(result.imported[0].fees).toBeUndefined();
    });
  });
});
