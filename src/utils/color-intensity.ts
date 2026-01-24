export type ColorIntensityResult = {
  backgroundColor: string;
  textColor: string;
};

export function calculatePnlColor(
  pnl: number,
  maxProfit: number,
  maxLoss: number,
  profitColor: string,
  lossColor: string,
  neutralColor: string
): ColorIntensityResult {
  // No trades or break-even
  if (pnl === 0 || (maxProfit === 0 && maxLoss === 0)) {
    return {
      backgroundColor: neutralColor,
      textColor: 'inherit',
    };
  }

  const MIN_INTENSITY = 0.2;
  const MAX_INTENSITY = 1.0;

  let intensity: number;
  let baseColor: string;

  if (pnl > 0) {
    baseColor = profitColor;
    const ratio = maxProfit > 0 ? pnl / maxProfit : 0;
    // Logarithmic scale: maps [0,1] to [0,1] with compression for outliers
    intensity =
      MIN_INTENSITY +
      (MAX_INTENSITY - MIN_INTENSITY) * Math.log10(1 + ratio * 9);
  } else {
    baseColor = lossColor;
    const ratio = maxLoss > 0 ? Math.abs(pnl) / maxLoss : 0;
    intensity =
      MIN_INTENSITY +
      (MAX_INTENSITY - MIN_INTENSITY) * Math.log10(1 + ratio * 9);
  }

  // Convert hex color to rgba with alpha
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  const backgroundColor = `rgba(${r}, ${g}, ${b}, ${intensity.toFixed(2)})`;

  // High intensity needs light text, low intensity uses default
  const textColor = intensity > 0.6 ? '#ffffff' : 'inherit';

  return { backgroundColor, textColor };
}
