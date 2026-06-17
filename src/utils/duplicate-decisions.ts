import { DuplicatePair } from '../hooks/use-duplicate-detection';
import { DuplicateDecision } from '../types';

export function makeDuplicatePairKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

export function getDecisionForPair(
  pair: DuplicatePair,
  decisions: DuplicateDecision[]
): DuplicateDecision | undefined {
  const pairKey = makeDuplicatePairKey(pair.existing.id, pair.imported.id);
  return decisions.find((decision) => decision.pairKey === pairKey);
}

export function isPairDecided(
  pair: DuplicatePair,
  decisions: DuplicateDecision[]
): boolean {
  return getDecisionForPair(pair, decisions) !== undefined;
}

export function filterPendingPairs(
  pairs: DuplicatePair[],
  decisions: DuplicateDecision[]
): DuplicatePair[] {
  if (decisions.length === 0) {
    return pairs;
  }

  const decidedKeys = new Set(decisions.map((decision) => decision.pairKey));
  return pairs.filter(
    (pair) =>
      !decidedKeys.has(makeDuplicatePairKey(pair.existing.id, pair.imported.id))
  );
}
