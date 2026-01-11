import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';

import { tradeService } from '../services/trade-service';
import { Trade } from '../types';

// Query keys for cache management
export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: () => [...tradeKeys.lists()] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
};

/**
 * Hook to fetch all trades
 */
export function useTradesQuery(): UseQueryResult<Trade[], Error> {
  return useQuery({
    queryKey: tradeKeys.list(),
    queryFn: () => tradeService.getTrades(),
  });
}

/**
 * Hook to add a new trade
 */
export function useAddTradeMutation(): UseMutationResult<
  Trade,
  Error,
  Trade,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trade: Trade) => tradeService.addTrade(trade),
    onSuccess: () => {
      // Invalidate and refetch trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

/**
 * Hook to update an existing trade
 */
export function useUpdateTradeMutation(): UseMutationResult<
  Trade,
  Error,
  { id: string; updates: Partial<Trade> },
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Trade> }) =>
      tradeService.updateTrade(id, updates),
    onSuccess: () => {
      // Invalidate and refetch trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

/**
 * Hook to delete a trade
 */
export function useDeleteTradeMutation(): UseMutationResult<
  void,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradeService.deleteTrade(id),
    onSuccess: () => {
      // Invalidate and refetch trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

/**
 * Hook to clear all trades
 */
export function useClearTradesMutation(): UseMutationResult<
  void,
  Error,
  void,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tradeService.clearAllTrades(),
    onSuccess: () => {
      // Invalidate and refetch trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

/**
 * Hook to import multiple trades
 */
export function useImportTradesMutation(): UseMutationResult<
  { imported: number; skipped: number },
  Error,
  Trade[],
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trades: Trade[]) => tradeService.importTrades(trades),
    onSuccess: () => {
      // Invalidate and refetch trades list
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}
