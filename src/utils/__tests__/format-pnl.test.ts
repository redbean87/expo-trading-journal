import { formatCompactPnl } from '../format-pnl';

describe('formatCompactPnl', () => {
  it('should format positive values under 1000', () => {
    expect(formatCompactPnl(500)).toBe('+$500');
    expect(formatCompactPnl(0)).toBe('+$0');
    expect(formatCompactPnl(99)).toBe('+$99');
  });

  it('should format negative values under 1000', () => {
    expect(formatCompactPnl(-500)).toBe('-$500');
    expect(formatCompactPnl(-99)).toBe('-$99');
  });

  it('should format values in thousands with K suffix', () => {
    expect(formatCompactPnl(1000)).toBe('+$1.0K');
    expect(formatCompactPnl(2700)).toBe('+$2.7K');
    expect(formatCompactPnl(15500)).toBe('+$15.5K');
    expect(formatCompactPnl(-3200)).toBe('-$3.2K');
  });

  it('should format values in millions with M suffix', () => {
    expect(formatCompactPnl(1000000)).toBe('+$1.0M');
    expect(formatCompactPnl(2500000)).toBe('+$2.5M');
    expect(formatCompactPnl(-1200000)).toBe('-$1.2M');
  });

  it('should handle decimal values', () => {
    expect(formatCompactPnl(1234.56)).toBe('+$1.2K');
    expect(formatCompactPnl(999.99)).toBe('+$1000');
  });
});
