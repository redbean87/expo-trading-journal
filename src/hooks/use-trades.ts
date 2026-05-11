import { useMutation, useQuery } from 'convex/react';
import React from 'react';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Trade } from '../types';

type BackendTrade = {
  id: Id<'trades'>;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: number;
  exitTime: number;
  side: string;
  pnl: number;
  pnlPercent: number;
  fees?: number;
  commissions?: number;
  notes?: string;
  strategy?: string;
  psychology?: string;
  whatWorked?: string;
  whatFailed?: string;
  confidence?: number;
  setupQuality?: number;
  ruleViolation?: string;
  importedFrom?: string;
  importId?: string;
  orderType?: string;
  accountBalanceAfter?: number;
  riskAmount?: number;
  stopLoss?: number;
  marketCondition?: string;
  htfContext?: string;
  structureBreakBeforeExit?: string;
  wouldTakeTradeAgain?: string;
};

function mapToTrade(trade: BackendTrade): Trade {
  return {
    ...trade,
    id: trade.id as string,
    entryTime: new Date(trade.entryTime),
    exitTime: new Date(trade.exitTime),
    side: trade.side as Trade['side'],
    importedFrom: trade.importedFrom as Trade['importedFrom'],
    structureBreakBeforeExit:
      trade.structureBreakBeforeExit as Trade['structureBreakBeforeExit'],
    wouldTakeTradeAgain:
      trade.wouldTakeTradeAgain as Trade['wouldTakeTradeAgain'],
  };
}

function mapFromTrade(trade: Trade | Omit<Trade, 'id'>) {
  const mapped: Record<string, unknown> = {
    ...trade,
    entryTime: trade.entryTime.getTime(),
    exitTime: trade.exitTime.getTime(),
  };
  delete mapped.id;
  return mapped as Omit<Trade, 'id'> & { entryTime: number; exitTime: number };
}

export function useTrades() {
  const data = useQuery(api.trades.getTrades, {});

  return {
    trades: data?.map(mapToTrade) ?? [],
    isLoading: data === undefined,
  };
}

export function useTradesInRange(startTime: number | null) {
  const data = useQuery(api.trades.getTradesInRange, {
    startTime: startTime ?? undefined,
  });

  const [previousData, setPreviousData] =
    React.useState<typeof data>(undefined);

  React.useEffect(() => {
    if (data !== undefined) {
      setPreviousData(data);
    }
  }, [data]);

  return {
    trades: (data ?? previousData)?.map(mapToTrade) ?? [],
    isLoading: data === undefined && previousData === undefined,
  };
}

export function useTrade(id: string | null) {
  const data = useQuery(
    api.trades.getTrade,
    id ? { id: id as Id<'trades'> } : 'skip'
  );

  return {
    trade: data ? mapToTrade(data) : null,
    isLoading: data === undefined && id !== null,
    notFound: data === null && id !== null,
  };
}

export function useAddTrade() {
  const mutate = useMutation(api.trades.addTrade);

  return async (trade: Omit<Trade, 'id'>): Promise<Trade> => {
    const result = await mutate(mapFromTrade(trade));
    return { ...trade, id: result.id as string };
  };
}

export function useUpdateTrade() {
  const mutate = useMutation(api.trades.updateTrade);

  return async (id: string, updates: Partial<Trade>): Promise<Trade> => {
    const result = await mutate({
      ...updates,
      id: id as Id<'trades'>,
      entryTime: updates.entryTime?.getTime(),
      exitTime: updates.exitTime?.getTime(),
    });

    return mapToTrade(result);
  };
}

export function useDeleteTrade() {
  const mutate = useMutation(api.trades.deleteTrade);

  return async (id: string): Promise<void> => {
    await mutate({ id: id as Id<'trades'> });
  };
}

export function useClearAllTrades() {
  const mutate = useMutation(api.trades.clearAllTrades);

  return async (): Promise<void> => {
    await mutate({});
  };
}

export function useImportTrades() {
  const mutate = useMutation(api.trades.importTrades);

  return async (
    trades: Omit<Trade, 'id'>[]
  ): Promise<{ imported: number; skipped: number; updated: number }> => {
    return await mutate({ trades: trades.map(mapFromTrade) });
  };
}
