import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { DuplicateDecision, DuplicateDecisionType } from '../types';

function mapDecision(decision: {
  id: Id<'duplicateDecisions'>;
  tradeAId: Id<'trades'>;
  tradeBId: Id<'trades'>;
  pairKey: string;
  decision: string;
  decidedAt: number;
}): DuplicateDecision {
  return {
    id: decision.id as string,
    tradeAId: decision.tradeAId as string,
    tradeBId: decision.tradeBId as string,
    pairKey: decision.pairKey,
    decision: decision.decision as DuplicateDecisionType,
    decidedAt: decision.decidedAt,
  };
}

export function useDuplicateDecisions() {
  const data = useQuery(api.duplicate_decisions.getDuplicateDecisions, {});

  return {
    decisions: data?.map(mapDecision) ?? [],
    isLoading: data === undefined,
  };
}

export function useRecordDuplicateDecision() {
  const mutate = useMutation(api.duplicate_decisions.recordDuplicateDecision);

  return async (
    tradeAId: string,
    tradeBId: string,
    decision: DuplicateDecisionType
  ): Promise<DuplicateDecision['id']> => {
    return await mutate({
      tradeAId: tradeAId as Id<'trades'>,
      tradeBId: tradeBId as Id<'trades'>,
      decision,
    });
  };
}
