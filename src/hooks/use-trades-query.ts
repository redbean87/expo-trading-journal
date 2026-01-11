import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';

import { tradeService } from '../services/trade-service';
import { Trade } from '../types';

export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: () => [...tradeKeys.lists()] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
};

export function useTradesQuery(): UseQueryResult<Trade[], Error> {
  return useQuery({
    queryKey: tradeKeys.list(),
    queryFn: () => tradeService.getTrades(),
  });
}

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
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: tradeKeys.list() });
    },
  });
}
