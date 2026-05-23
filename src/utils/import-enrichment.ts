/**
 * Build a patch object for enriching an existing trade with data from an
 * incoming import.
 *
 * **Vendor-authoritative fields** (always overwritten if incoming has a value):
 * `entryPrice`, `exitPrice`, `entryTime`, `exitTime`, `pnl`, `pnlPercent`,
 * `fees`, `commissions`, `orderType`, `accountBalanceAfter`, `importedFrom`.
 *
 * **Fill-if-empty fields** (only set if existing is null/undefined):
 * `importId`.
 *
 * **Protected fields** (never overwritten):
 * `notes`, `psychology`, `whatWorked`, `whatFailed`, `confidence`,
 * `setupQuality`, `ruleViolation`, `stopLoss`, `marketCondition`, `htfContext`,
 * `structureBreakBeforeExit`, `wouldTakeTradeAgain`, `strategy`, `riskAmount`,
 * `symbol`, `quantity`, `side`.
 *
 * Returns `null` when nothing needs to change.
 *
 * Keep in sync with `convex/trades.ts` — `buildEnrichmentUpdates`.
 */
export function buildEnrichmentUpdates(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>
): Record<string, unknown> | null {
  const updates: Record<string, unknown> = {};

  const vendorAuthoritative = [
    'entryPrice',
    'exitPrice',
    'entryTime',
    'exitTime',
    'pnl',
    'pnlPercent',
    'fees',
    'commissions',
    'orderType',
    'accountBalanceAfter',
    'importedFrom',
  ] as const;

  const fillIfEmpty = ['importId'] as const;

  // Vendor-authoritative: incoming value wins when defined
  for (const key of vendorAuthoritative) {
    const incomingValue = incoming[key];
    if (incomingValue !== undefined && incomingValue !== null) {
      const existingValue = existing[key];
      if (existingValue !== incomingValue) {
        updates[key] = incomingValue;
      }
    }
  }

  // Fill-if-empty: only set when existing is missing
  for (const key of fillIfEmpty) {
    const incomingValue = incoming[key];
    if (incomingValue !== undefined && incomingValue !== null) {
      const existingValue = existing[key];
      if (existingValue === undefined || existingValue === null) {
        updates[key] = incomingValue;
      }
    }
  }

  return Object.keys(updates).length > 0 ? updates : null;
}
