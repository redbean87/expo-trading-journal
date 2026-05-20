import { useCallback, useMemo, useState } from 'react';

import { Trade, TradeSide } from '../types';
import { DateRangePreset, getDateRangeStart } from '../utils/date-range';

export type PnlFilter = 'all' | 'winning' | 'losing';

export type TradeFilters = {
  searchQuery: string;
  side: TradeSide | 'all';
  pnl: PnlFilter;
  strategy: string | 'all';
};

const defaultFilters: TradeFilters = {
  searchQuery: '',
  side: 'all',
  pnl: 'all',
  strategy: 'all',
};

function getTimeRangeBounds(
  selectedRange: DateRangePreset,
  customRangeStart?: number | null,
  customRangeEnd?: number | null
): { start: number | null; end: number | null } {
  if (selectedRange === 'all') {
    return { start: null, end: null };
  }
  if (selectedRange === 'custom') {
    return { start: customRangeStart ?? null, end: customRangeEnd ?? null };
  }
  return { start: getDateRangeStart(selectedRange), end: null };
}

export function useTradeFilters(
  trades: Trade[],
  initialFilters?: Partial<TradeFilters>,
  selectedRange?: DateRangePreset,
  customRangeStart?: number | null,
  customRangeEnd?: number | null
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

  const timeBounds = useMemo(
    () =>
      getTimeRangeBounds(
        selectedRange ?? 'all',
        customRangeStart,
        customRangeEnd
      ),
    [selectedRange, customRangeStart, customRangeEnd]
  );

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // Time range filter (from global store)
      if (
        timeBounds.start != null &&
        trade.exitTime.getTime() < timeBounds.start
      ) {
        return false;
      }
      if (timeBounds.end != null && trade.exitTime.getTime() > timeBounds.end) {
        return false;
      }

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

      return true;
    });
  }, [trades, filters, timeBounds]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedRange && selectedRange !== 'all') count++;
    if (filters.side !== 'all') count++;
    if (filters.pnl !== 'all') count++;
    if (filters.strategy !== 'all') count++;
    return count;
  }, [filters, selectedRange]);

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
