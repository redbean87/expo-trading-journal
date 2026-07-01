import { resolveSymbol } from '../cusip-to-ticker';

describe('resolveSymbol', () => {
  it('resolves known CUSIP to ticker', () => {
    expect(resolveSymbol('44984F807')).toBe('IVF');
  });

  it('resolves known CUSIP with lowercase input', () => {
    expect(resolveSymbol('44984f807')).toBe('IVF');
  });

  it('resolves known CUSIP G3514S104 to GMEX', () => {
    expect(resolveSymbol('G3514S104')).toBe('GMEX');
  });

  it('passes through alphabetic ticker unchanged', () => {
    expect(resolveSymbol('AAPL')).toBe('AAPL');
  });

  it('passes through known ticker that looks like CUSIP but is in map', () => {
    expect(resolveSymbol('IVF')).toBe('IVF');
  });

  it('passes through lowercase ticker uppercased', () => {
    expect(resolveSymbol('aapl')).toBe('AAPL');
  });

  it('returns unknown CUSIP as-is', () => {
    expect(resolveSymbol('123456789')).toBe('123456789');
  });

  it('returns empty string for empty input', () => {
    expect(resolveSymbol('')).toBe('');
  });

  it('returns short alphanumeric as uppercase', () => {
    expect(resolveSymbol('ab1')).toBe('AB1');
  });
});
