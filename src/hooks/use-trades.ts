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
  ruleViolation?: string;
  importedFrom?: string;
  riskAmount?: number;
  marketCondition?: string;
};

function mapToTrade(trade: BackendTrade): Trade {
  return {
    id: trade.id,
    symbol: trade.symbol,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    quantity: trade.quantity,
    entryTime: new Date(trade.entryTime),
    exitTime: new Date(trade.exitTime),
    side: trade.side as 'long' | 'short',
    pnl: trade.pnl,
    pnlPercent: trade.pnlPercent,
    fees: trade.fees,
    commissions: trade.commissions,
    notes: trade.notes,
    strategy: trade.strategy,
    psychology: trade.psychology,
    whatWorked: trade.whatWorked,
    whatFailed: trade.whatFailed,
    confidence: trade.confidence,
    ruleViolation: trade.ruleViolation,
    importedFrom: trade.importedFrom as
      | 'cash-balance'
      | 'trade-history'
      | undefined,
    riskAmount: trade.riskAmount,
    marketCondition: trade.marketCondition,
  };
}

function mapFromTrade(trade: Trade) {
  return {
    symbol: trade.symbol,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    quantity: trade.quantity,
    entryTime: trade.entryTime.getTime(),
    exitTime: trade.exitTime.getTime(),
    side: trade.side,
    pnl: trade.pnl,
    pnlPercent: trade.pnlPercent,
    fees: trade.fees,
    commissions: trade.commissions,
    notes: trade.notes,
    strategy: trade.strategy,
    psychology: trade.psychology,
    whatWorked: trade.whatWorked,
    whatFailed: trade.whatFailed,
    confidence: trade.confidence,
    ruleViolation: trade.ruleViolation,
    importedFrom: trade.importedFrom,
    riskAmount: trade.riskAmount,
    marketCondition: trade.marketCondition,
  };
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

  return async (trade: Trade): Promise<Trade> => {
    const result = await mutate(mapFromTrade(trade));
    return { ...trade, id: result.id };
  };
}

export function useUpdateTrade() {
  const mutate = useMutation(api.trades.updateTrade);

  return async (id: string, updates: Partial<Trade>): Promise<Trade> => {
    const result = await mutate({
      id: id as Id<'trades'>,
      symbol: updates.symbol,
      entryPrice: updates.entryPrice,
      exitPrice: updates.exitPrice,
      quantity: updates.quantity,
      entryTime: updates.entryTime?.getTime(),
      exitTime: updates.exitTime?.getTime(),
      side: updates.side,
      pnl: updates.pnl,
      pnlPercent: updates.pnlPercent,
      fees: updates.fees,
      commissions: updates.commissions,
      notes: updates.notes,
      strategy: updates.strategy,
      psychology: updates.psychology,
      whatWorked: updates.whatWorked,
      whatFailed: updates.whatFailed,
      confidence: updates.confidence,
      ruleViolation: updates.ruleViolation,
      riskAmount: updates.riskAmount,
      marketCondition: updates.marketCondition,
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
    trades: Trade[]
  ): Promise<{ imported: number; skipped: number; updated: number }> => {
    return await mutate({ trades: trades.map(mapFromTrade) });
  };
}
