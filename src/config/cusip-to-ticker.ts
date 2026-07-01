const cusipToTicker: Record<string, string> = {
  '44984F807': 'IVF',
  G3514S104: 'GMEX',
};

const cusipPattern = /^[A-Z0-9]{9}$/;

export function resolveSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  const mapped = cusipToTicker[upper];
  if (mapped) return mapped;
  if (cusipPattern.test(upper)) return upper;
  return upper;
}
