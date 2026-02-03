import { useCallback, useMemo, useState } from 'react';

import { Trade, TradeSide } from '../types';

export type PnlFilter = 'all' | 'winning' | 'losing';

export type TradeFilters = {
  searchQuery: string;
  side: TradeSide | 'all';
  pnl: PnlFilter;
  strategy: string | 'all';
  dateFrom: Date | null;
  dateTo: Date | null;
};

const defaultFilters: TradeFilters = {
  searchQuery: '',
  side: 'all',
  pnl: 'all',
  strategy: 'all',
  dateFrom: null,
  dateTo: null,
};

export function useTradeFilters(
  trades: Trade[],
  initialFilters?: Partial<TradeFilters>
) {
  const [filters, setFilters] = useState<TradeFilters>(() => ({
    ...defaultFilters,
    ...initialFilters,
  }));

  const uniqueStrategies = useMemo(() => {
    const strategies = trades
      .map((t) => t.strategy)
      .filter((s): s is string => Boolean(s));
    return [...new Set(strategies)].sort();
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // Search query - match symbol or strategy
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSymbol = trade.symbol.toLowerCase().includes(query);
        const matchesStrategy = trade.strategy?.toLowerCase().includes(query);
        if (!matchesSymbol && !matchesStrategy) {
          return false;
        }
      }

      // Side filter
      if (filters.side !== 'all' && trade.side !== filters.side) {
        return false;
      }

      // P&L filter
      if (filters.pnl === 'winning' && trade.pnl <= 0) {
        return false;
      }
      if (filters.pnl === 'losing' && trade.pnl >= 0) {
        return false;
      }

      // Strategy filter
      if (filters.strategy !== 'all' && trade.strategy !== filters.strategy) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && trade.exitTime < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (trade.exitTime > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [trades, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.side !== 'all') count++;
    if (filters.pnl !== 'all') count++;
    if (filters.strategy !== 'all') count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = filters.searchQuery !== '' || activeFilterCount > 0;

  const updateFilter = useCallback(
    <K extends keyof TradeFilters>(key: K, value: TradeFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    setFilters,
    filteredTrades,
    uniqueStrategies,
    activeFilterCount,
    hasActiveFilters,
    updateFilter,
    clearFilters,
  };
}
