import { useMutation, useQuery } from 'convex/react';

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
  notes?: string;
  strategy?: string;
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
    notes: trade.notes,
    strategy: trade.strategy,
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
    notes: trade.notes,
    strategy: trade.strategy,
  };
}

/**
 * Real-time trades subscription.
 * Automatically updates when data changes on the server.
 */
export function useTrades() {
  const data = useQuery(api.trades.getTrades, {});

  return {
    trades: data?.map(mapToTrade) ?? [],
    isLoading: data === undefined,
  };
}

/**
 * Returns a function to add a new trade.
 */
export function useAddTrade() {
  const mutate = useMutation(api.trades.addTrade);

  return async (trade: Trade): Promise<Trade> => {
    const result = await mutate(mapFromTrade(trade));
    return { ...trade, id: result.id };
  };
}

/**
 * Returns a function to update an existing trade.
 */
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
      notes: updates.notes,
      strategy: updates.strategy,
    });

    return mapToTrade(result);
  };
}

/**
 * Returns a function to delete a trade.
 */
export function useDeleteTrade() {
  const mutate = useMutation(api.trades.deleteTrade);

  return async (id: string): Promise<void> => {
    await mutate({ id: id as Id<'trades'> });
  };
}

/**
 * Returns a function to clear all trades.
 */
export function useClearAllTrades() {
  const mutate = useMutation(api.trades.clearAllTrades);

  return async (): Promise<void> => {
    await mutate({});
  };
}

/**
 * Returns a function to import multiple trades.
 */
export function useImportTrades() {
  const mutate = useMutation(api.trades.importTrades);

  return async (
    trades: Trade[]
  ): Promise<{ imported: number; skipped: number }> => {
    return await mutate({ trades: trades.map(mapFromTrade) });
  };
}
