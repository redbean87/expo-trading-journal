import { calculateRiskDivergence } from '../risk-divergence';

describe('calculateRiskDivergence', () => {
  it('should return null when required values are missing or invalid', () => {
    expect(calculateRiskDivergence(0, 90, 10, 100)).toBeNull();
    expect(calculateRiskDivergence(100, 0, 10, 100)).toBeNull();
    expect(calculateRiskDivergence(100, 90, 0, 100)).toBeNull();
    expect(calculateRiskDivergence(100, 90, 10, 0)).toBeNull();
    expect(calculateRiskDivergence(NaN, 90, 10, 100)).toBeNull();
  });

  it('should calculate implied risk for a long trade', () => {
    const result = calculateRiskDivergence(100, 95, 10, 50);

    expect(result).not.toBeNull();
    expect(result!.impliedRisk).toBe(50);
    expect(result!.divergence).toBe(0);
    expect(result!.hasDivergence).toBe(false);
  });

  it('should calculate implied risk for a short trade', () => {
    const result = calculateRiskDivergence(100, 105, 10, 50);

    expect(result).not.toBeNull();
    expect(result!.impliedRisk).toBe(50);
    expect(result!.divergence).toBe(0);
    expect(result!.hasDivergence).toBe(false);
  });

  it('should detect divergence when implied risk is higher than entered risk', () => {
    const result = calculateRiskDivergence(100, 94, 10, 50);

    expect(result).not.toBeNull();
    expect(result!.impliedRisk).toBe(60);
    expect(result!.divergence).toBe(10);
    expect(result!.hasDivergence).toBe(true);
    expect(result!.message).toContain('$60.00');
    expect(result!.message).toContain('$10.00 higher');
    expect(result!.message).toContain('$50.00');
  });

  it('should detect divergence when implied risk is lower than entered risk', () => {
    const result = calculateRiskDivergence(100, 97, 10, 50);

    expect(result).not.toBeNull();
    expect(result!.impliedRisk).toBe(30);
    expect(result!.divergence).toBe(-20);
    expect(result!.hasDivergence).toBe(true);
    expect(result!.message).toContain('$20.00 lower');
  });

  it('should not flag small dollar divergences', () => {
    const result = calculateRiskDivergence(100, 95.1, 10, 50);

    expect(result).not.toBeNull();
    expect(result!.impliedRisk).toBeCloseTo(49, 1);
    expect(result!.divergence).toBeCloseTo(-1, 1);
    expect(result!.hasDivergence).toBe(false);
    expect(result!.message).toBe('');
  });

  it('should flag divergences above the percentage threshold even with small dollar differences', () => {
    const result = calculateRiskDivergence(100, 90, 1, 15);

    expect(result).not.toBeNull();
    expect(result!.impliedRisk).toBe(10);
    expect(result!.divergence).toBe(-5);
    expect(result!.divergencePercent).toBeCloseTo(-0.333, 2);
    expect(result!.hasDivergence).toBe(true);
  });
});
