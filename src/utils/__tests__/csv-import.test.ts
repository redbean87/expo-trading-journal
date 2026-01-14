import { parseCsvFile } from '../csv-import';

describe('CSV Import - Side Detection', () => {
  it('should detect long from explicit side column', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,side
AAPL,100,150,160,2024-01-01T10:00:00,2024-01-01T11:00:00,long`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('long');
    expect(result.imported[0].quantity).toBe(100);
  });

  it('should detect short from explicit side column', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,side
AAPL,100,160,150,2024-01-01T10:00:00,2024-01-01T11:00:00,short`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('short');
    expect(result.imported[0].quantity).toBe(100);
  });

  it('should detect short from sell direction', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,direction
AAPL,100,160,150,2024-01-01T10:00:00,2024-01-01T11:00:00,sell`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('short');
  });

  it('should detect short from negative quantity', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime
AAPL,-100,160,150,2024-01-01T10:00:00,2024-01-01T11:00:00`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('short');
    expect(result.imported[0].quantity).toBe(100);
  });

  it('should detect long from buy action', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,action
AAPL,100,150,160,2024-01-01T10:00:00,2024-01-01T11:00:00,buy`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('long');
  });

  it('should default to long when no side indicator', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime
AAPL,100,150,160,2024-01-01T10:00:00,2024-01-01T11:00:00`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('long');
  });

  it('should detect short from type column with "s"', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,type
AAPL,100,160,150,2024-01-01T10:00:00,2024-01-01T11:00:00,s`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('short');
  });

  it('should detect long from type column with "l"', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,type
AAPL,100,150,160,2024-01-01T10:00:00,2024-01-01T11:00:00,l`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('long');
  });

  it('should calculate PnL correctly for short trades', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,side
AAPL,100,160,150,2024-01-01T10:00:00,2024-01-01T11:00:00,short`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].pnl).toBe(1000); // (160 - 150) * 100
    expect(result.imported[0].pnlPercent).toBeCloseTo(6.25, 2); // 1000 / 16000 * 100
  });

  it('should handle case-insensitive side values', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,side
AAPL,100,160,150,2024-01-01T10:00:00,2024-01-01T11:00:00,SHORT`;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('short');
  });

  it('should handle whitespace in side values', async () => {
    const csv = `symbol,shares,entryPrice,exitPrice,entryTime,exitTime,side
AAPL,100,150,160,2024-01-01T10:00:00,2024-01-01T11:00:00, long `;

    const result = await parseCsvFile(csv);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].side).toBe('long');
  });
});
