import { useMemo } from 'react';

import { Trade } from '../types';
import { useDuplicateDecisions } from './use-duplicate-decisions';
import { filterPendingPairs } from '../utils/duplicate-decisions';

export type DuplicatePair = {
  existing: Trade;
  imported: Trade;
};

const FUZZY_MATCH_MS = 10 * 1000; // 10 seconds

/**
 * Detects potential duplicate trades from TOS imports.
 * Matches: same symbol + same quantity + entryTime within 10s + at least one is TOS-imported
 */
export function findPotentialDuplicates(trades: Trade[]): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];
  const processed = new Set<string>();

  // Only check trades that were imported from TOS
  const tosTrades = trades.filter(
    (t) => t.importedFrom === 'tos-merged' || t.importedFrom === 'trade-history'
  );

  for (const imported of tosTrades) {
    // Find existing trades that might be duplicates
    const candidates = trades.filter((existing) => {
      // Don't compare with self
      if (existing.id === imported.id) return false;

      // Must be same symbol and quantity
      if (
        existing.symbol !== imported.symbol ||
        existing.quantity !== imported.quantity
      ) {
        return false;
      }

      // Entry times must be within 60 seconds
      const timeDiff = Math.abs(
        existing.entryTime.getTime() - imported.entryTime.getTime()
      );
      if (timeDiff > FUZZY_MATCH_MS) return false;

      // At least one should be from TOS import (not manually entered)
      const isImported =
        existing.importedFrom === 'cash-balance' ||
        existing.importedFrom === 'trade-history' ||
        existing.importedFrom === 'tos-merged';

      return isImported;
    });

    for (const existing of candidates) {
      const pairKey = [existing.id, imported.id].sort().join('-');
      if (processed.has(pairKey)) continue;
      processed.add(pairKey);

      pairs.push({ existing, imported });
    }
  }

  return pairs;
}

/**
 * Hook that detects duplicates from the current trades list
 */
export function useDuplicateDetection(trades: Trade[]): DuplicatePair[] {
  return useMemo(() => findPotentialDuplicates(trades), [trades]);
}

export function usePendingDuplicatePairs(trades: Trade[]): DuplicatePair[] {
  const pairs = useDuplicateDetection(trades);
  const { decisions } = useDuplicateDecisions();

  return useMemo(
    () => filterPendingPairs(pairs, decisions),
    [pairs, decisions]
  );
}
