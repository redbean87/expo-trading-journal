import { calculatePnlColor, rgbaToHex } from '../color-intensity';

describe('calculatePnlColor', () => {
  const profitColor = '#4caf50';
  const lossColor = '#f44336';
  const neutralColor = '#f5f5f5';

  describe('neutral cases', () => {
    it('should return neutral color for zero pnl', () => {
      const result = calculatePnlColor(
        0,
        100,
        100,
        profitColor,
        lossColor,
        neutralColor
      );
      expect(result.backgroundColor).toBe(neutralColor);
      expect(result.textColor).toBe('inherit');
    });

    it('should return neutral color when max values are zero', () => {
      const result = calculatePnlColor(
        50,
        0,
        0,
        profitColor,
        lossColor,
        neutralColor
      );
      expect(result.backgroundColor).toBe(neutralColor);
    });
  });

  describe('profit cases', () => {
    it('should return profit color with high intensity for max profit', () => {
      const result = calculatePnlColor(
        100,
        100,
        50,
        profitColor,
        lossColor,
        neutralColor
      );
      expect(result.backgroundColor).toMatch(/rgba\(76, 175, 80/);
      expect(result.textColor).toBe('#ffffff');
    });

    it('should return profit color with lower intensity for small profit', () => {
      const result = calculatePnlColor(
        10,
        100,
        50,
        profitColor,
        lossColor,
        neutralColor
      );
      expect(result.backgroundColor).toMatch(/rgba\(76, 175, 80/);
      // Small profit should have low intensity, so text remains inherit
      expect(result.textColor).toBe('inherit');
    });

    it('should scale intensity based on pnl ratio', () => {
      const smallProfit = calculatePnlColor(
        25,
        100,
        50,
        profitColor,
        lossColor,
        neutralColor
      );
      const largeProfit = calculatePnlColor(
        75,
        100,
        50,
        profitColor,
        lossColor,
        neutralColor
      );

      // Extract alpha values from rgba strings
      const smallAlpha = parseFloat(
        smallProfit.backgroundColor.match(/[\d.]+\)$/)?.[0] || '0'
      );
      const largeAlpha = parseFloat(
        largeProfit.backgroundColor.match(/[\d.]+\)$/)?.[0] || '0'
      );

      expect(largeAlpha).toBeGreaterThan(smallAlpha);
    });
  });

  describe('loss cases', () => {
    it('should return loss color with high intensity for max loss', () => {
      const result = calculatePnlColor(
        -100,
        50,
        100,
        profitColor,
        lossColor,
        neutralColor
      );
      expect(result.backgroundColor).toMatch(/rgba\(244, 67, 54/);
      expect(result.textColor).toBe('#ffffff');
    });

    it('should return loss color with lower intensity for small loss', () => {
      const result = calculatePnlColor(
        -10,
        50,
        100,
        profitColor,
        lossColor,
        neutralColor
      );
      expect(result.backgroundColor).toMatch(/rgba\(244, 67, 54/);
    });

    it('should scale intensity based on loss ratio', () => {
      const smallLoss = calculatePnlColor(
        -25,
        50,
        100,
        profitColor,
        lossColor,
        neutralColor
      );
      const largeLoss = calculatePnlColor(
        -75,
        50,
        100,
        profitColor,
        lossColor,
        neutralColor
      );

      const smallAlpha = parseFloat(
        smallLoss.backgroundColor.match(/[\d.]+\)$/)?.[0] || '0'
      );
      const largeAlpha = parseFloat(
        largeLoss.backgroundColor.match(/[\d.]+\)$/)?.[0] || '0'
      );

      expect(largeAlpha).toBeGreaterThan(smallAlpha);
    });
  });

  describe('logarithmic scaling', () => {
    it('should have minimum intensity above 0.2', () => {
      const result = calculatePnlColor(
        1,
        1000,
        1000,
        profitColor,
        lossColor,
        neutralColor
      );
      const alpha = parseFloat(
        result.backgroundColor.match(/[\d.]+\)$/)?.[0] || '0'
      );
      expect(alpha).toBeGreaterThanOrEqual(0.2);
    });

    it('should have maximum intensity at or below 1.0', () => {
      const result = calculatePnlColor(
        1000,
        1000,
        500,
        profitColor,
        lossColor,
        neutralColor
      );
      const alpha = parseFloat(
        result.backgroundColor.match(/[\d.]+\)$/)?.[0] || '0'
      );
      expect(alpha).toBeLessThanOrEqual(1.0);
    });
  });
});

describe('rgbaToHex', () => {
  it('should convert rgba() to hex', () => {
    expect(rgbaToHex('rgba(208, 188, 255, 1)')).toBe('#D0BCFF');
    expect(rgbaToHex('rgba(76, 175, 80, 0.5)')).toBe('#4CAF50');
    expect(rgbaToHex('rgba(244, 67, 54, 1)')).toBe('#F44336');
  });

  it('should convert rgb() to hex', () => {
    expect(rgbaToHex('rgb(208, 188, 255)')).toBe('#D0BCFF');
    expect(rgbaToHex('rgb(76, 175, 80)')).toBe('#4CAF50');
  });

  it('should handle hex colors as-is', () => {
    expect(rgbaToHex('#D0BCFF')).toBe('#D0BCFF');
    expect(rgbaToHex('#4caf50')).toBe('#4CAF50');
    expect(rgbaToHex('#F44336')).toBe('#F44336');
  });

  it('should handle colors with extra spacing', () => {
    expect(rgbaToHex('rgba(208,  188,  255,  1)')).toBe('#D0BCFF');
    expect(rgbaToHex('rgb(76,175,80)')).toBe('#4CAF50');
  });

  it('should convert single-digit values correctly', () => {
    expect(rgbaToHex('rgba(0, 0, 0, 1)')).toBe('#000000');
    expect(rgbaToHex('rgba(255, 255, 255, 1)')).toBe('#FFFFFF');
    expect(rgbaToHex('rgba(1, 2, 3, 0.5)')).toBe('#010203');
  });

  it('should return invalid formats as-is', () => {
    expect(rgbaToHex('invalid')).toBe('invalid');
    expect(rgbaToHex('hsl(0, 100%, 50%)')).toBe('hsl(0, 100%, 50%)');
  });
});
