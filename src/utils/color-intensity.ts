export type ColorIntensityResult = {
  backgroundColor: string;
  textColor: string;
};

/**
 * Adds an alpha channel to a color string.
 * Supports hex (#RRGGBB or #RGB) and rgba()/rgb() formats.
 * Returns the color with the specified alpha (0-1).
 *
 * @param color - Color string in hex or rgba/rgb format
 * @param alpha - Alpha value between 0 and 1
 * @returns Color string with alpha applied
 *
 * @example
 * withAlpha("#4CAF50", 0.12) // "#4CAF501F"
 * withAlpha("rgba(76, 175, 80, 1)", 0.12) // "rgba(76, 175, 80, 0.12)"
 */
export function withAlpha(color: string, alpha: number): string {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  // Hex format (#RRGGBB or #RGB)
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    // Expand shorthand (#RGB -> #RRGGBB)
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const a = Math.round(clampedAlpha * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${hex}${a}`;
  }

  // rgba() or rgb() format
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${clampedAlpha})`;
  }

  // Fallback: return original color
  return color;
}

/**
 * Converts an RGBA or RGB color string to hex format (#RRGGBB).
 * If the input is already in hex format, returns it as-is.
 *
 * @param color - Color string in format "rgba(r, g, b, a)" or "rgb(r, g, b)" or "#RRGGBB"
 * @returns Hex color string in format "#RRGGBB"
 *
 * @example
 * rgbaToHex("rgba(208, 188, 255, 1)") // "#D0BCFF"
 * rgbaToHex("rgb(76, 175, 80)") // "#4CAF50"
 * rgbaToHex("#4CAF50") // "#4CAF50"
 */
export function rgbaToHex(color: string): string {
  // Already in hex format
  if (color.startsWith('#')) {
    return color.toUpperCase();
  }

  // Extract RGB values from rgba() or rgb() format
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    // Invalid format, return as-is
    return color;
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  // Convert to 2-digit hex and combine
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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
