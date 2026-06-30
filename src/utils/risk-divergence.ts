const DOLLAR_THRESHOLD = 5;
const PERCENT_THRESHOLD = 0.1;

export type RiskDivergence = {
  impliedRisk: number;
  enteredRisk: number;
  divergence: number;
  divergencePercent: number;
  hasDivergence: boolean;
  message: string;
};

export function calculateRiskDivergence(
  entryPrice: number,
  stopLoss: number,
  quantity: number,
  riskAmount: number
): RiskDivergence | null {
  if (
    isNaN(entryPrice) ||
    entryPrice <= 0 ||
    isNaN(stopLoss) ||
    stopLoss <= 0 ||
    isNaN(quantity) ||
    quantity <= 0 ||
    isNaN(riskAmount) ||
    riskAmount <= 0
  ) {
    return null;
  }

  const impliedRisk = Math.abs(entryPrice - stopLoss) * quantity;
  const divergence = impliedRisk - riskAmount;

  if (riskAmount === 0) {
    return null;
  }

  const divergencePercent = divergence / riskAmount;

  const hasDivergence =
    Math.abs(divergence) > DOLLAR_THRESHOLD ||
    Math.abs(divergencePercent) > PERCENT_THRESHOLD;

  let message = '';
  if (hasDivergence) {
    const higherLower = divergence > 0 ? 'higher' : 'lower';
    message = `Your stop loss implies $${impliedRisk.toFixed(2)} of risk, which is $${Math.abs(divergence).toFixed(2)} ${higherLower} than your entered risk amount ($${riskAmount.toFixed(2)}).`;
  }

  return {
    impliedRisk,
    enteredRisk: riskAmount,
    divergence,
    divergencePercent,
    hasDivergence,
    message,
  };
}
