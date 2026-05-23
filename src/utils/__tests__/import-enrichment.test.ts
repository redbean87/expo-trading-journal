import { buildEnrichmentUpdates } from '../import-enrichment';

describe('buildEnrichmentUpdates', () => {
  it('returns null when existing and incoming are identical', () => {
    const existing = { symbol: 'AAPL', entryPrice: 150, fees: 2 };
    const incoming = { symbol: 'AAPL', entryPrice: 150, fees: 2 };
    expect(buildEnrichmentUpdates(existing, incoming)).toBeNull();
  });

  it('enriches vendor-authoritative fields when incoming has values', () => {
    const existing = { entryPrice: 150, exitPrice: 155, fees: undefined };
    const incoming = { entryPrice: 150.5, exitPrice: 155, fees: 2.5 };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toEqual({ entryPrice: 150.5, fees: 2.5 });
  });

  it('sets importId only when existing lacks it', () => {
    const existing = { symbol: 'AAPL', importId: undefined };
    const incoming = { symbol: 'AAPL', importId: 'cb-123' };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toEqual({ importId: 'cb-123' });
  });

  it('does not overwrite existing importId', () => {
    const existing = { symbol: 'AAPL', importId: 'old-123' };
    const incoming = { symbol: 'AAPL', importId: 'new-456' };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toBeNull();
  });

  it('never overwrites protected user journal fields', () => {
    const existing = {
      notes: 'Manual note',
      psychology: 'calm',
      setupQuality: 4,
      stopLoss: 145,
    };
    const incoming = {
      notes: 'Imported note',
      psychology: 'anxious',
      setupQuality: 2,
      stopLoss: 140,
    };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toBeNull();
  });

  it('does not change symbol, quantity, or side', () => {
    const existing = { symbol: 'AAPL', quantity: 100, side: 'long' };
    const incoming = { symbol: 'AAPL', quantity: 200, side: 'short' };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toBeNull();
  });

  it('updates entryTime and exitTime from vendor import', () => {
    const existing = { entryTime: 1000, exitTime: 2000 };
    const incoming = { entryTime: 1050, exitTime: 2050 };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toEqual({ entryTime: 1050, exitTime: 2050 });
  });

  it('updates importedFrom when incoming has a value', () => {
    const existing = { importedFrom: undefined };
    const incoming = { importedFrom: 'tos-merged' };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toEqual({ importedFrom: 'tos-merged' });
  });

  it('updates multiple fields in one pass', () => {
    const existing = {
      entryPrice: 150,
      fees: undefined,
      commissions: undefined,
      importId: undefined,
      importedFrom: undefined,
    };
    const incoming = {
      entryPrice: 150.5,
      fees: 2.5,
      commissions: 1.0,
      importId: 'cb-123',
      importedFrom: 'tos-merged',
    };
    const updates = buildEnrichmentUpdates(existing, incoming);
    expect(updates).toEqual({
      entryPrice: 150.5,
      fees: 2.5,
      commissions: 1.0,
      importId: 'cb-123',
      importedFrom: 'tos-merged',
    });
  });
});
