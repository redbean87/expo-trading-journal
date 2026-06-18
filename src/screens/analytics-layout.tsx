import { Slot, usePathname, useRouter } from 'expo-router';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { AnalyticsTabs } from '../components/analytics-tabs';
import { DateRangeFilter } from '../components/date-range-filter';
import { LoadingState } from '../components/loading-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTradesInRange } from '../hooks/use-trades';
import { useAnalyticsStore } from '../store/analytics-store';
import { useTimeFilterStore } from '../store/time-filter-store';
import { AnalyticsSegment, Trade } from '../types';
import { getDateRangeStart } from '../utils/date-range';
import { StrategyFilter } from './analytics/strategy-filter';

type AnalyticsLayoutContextValue = {
  setScrollEnabled: (enabled: boolean) => void;
};

const AnalyticsLayoutContext = createContext<AnalyticsLayoutContextValue>({
  setScrollEnabled: () => {},
});

export const useAnalyticsLayout = () => useContext(AnalyticsLayoutContext);

type AnalyticsDataContextValue = {
  trades: Trade[];
};

const AnalyticsDataContext = createContext<AnalyticsDataContextValue>({
  trades: [],
});

export const useAnalyticsData = () => useContext(AnalyticsDataContext);

type AnalyticsLayoutProps = {
  children?: ReactNode;
};

export function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const {
    selectedRange,
    setSelectedRange,
    customRangeStart,
    customRangeEnd,
    setCustomRange,
  } = useTimeFilterStore();
  const { selectedStrategy, setSelectedStrategy } = useAnalyticsStore();

  const startTime =
    selectedRange === 'custom'
      ? customRangeStart
      : getDateRangeStart(selectedRange);
  const { trades: rawTrades, isLoading } = useTradesInRange(startTime);

  const strategies = useMemo(
    () =>
      Array.from(
        new Set(rawTrades.map((t) => t.strategy).filter(Boolean))
      ).sort() as string[],
    [rawTrades]
  );

  const trades = useMemo(() => {
    let filtered =
      selectedRange !== 'custom' || !customRangeEnd
        ? rawTrades
        : rawTrades.filter((t) => t.exitTime.getTime() <= customRangeEnd);
    if (selectedStrategy) {
      filtered = filtered.filter((t) => t.strategy === selectedStrategy);
    }
    return filtered;
  }, [rawTrades, selectedRange, customRangeEnd, selectedStrategy]);

  const getSegment = (): AnalyticsSegment => {
    if (pathname.includes('/patterns')) return 'patterns';
    if (pathname.includes('/charts')) return 'charts';
    if (pathname.includes('/psychology')) return 'psychology';
    if (pathname.includes('/strategy')) return 'strategy';
    if (pathname.includes('/market-condition')) return 'market-condition';
    if (pathname.includes('/htf-context')) return 'htf-context';
    if (pathname.includes('/ai-insights')) return 'ai-insights';
    if (pathname.includes('/symbols')) return 'symbols';
    return 'overview';
  };

  const segments: { value: AnalyticsSegment; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'charts', label: 'Charts' },
    { value: 'symbols', label: 'Symbols' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'patterns', label: 'Patterns' },
    { value: 'market-condition', label: 'Market' },
    { value: 'htf-context', label: 'HTF' },
    { value: 'psychology', label: 'Psych' },
    { value: 'ai-insights', label: 'AI' },
  ];

  const routes: Record<AnalyticsSegment, string> = {
    overview: '/analytics',
    charts: '/analytics/charts',
    symbols: '/analytics/symbols',
    strategy: '/analytics/strategy',
    patterns: '/analytics/patterns',
    'market-condition': '/analytics/market-condition',
    'htf-context': '/analytics/htf-context',
    psychology: '/analytics/psychology',
    'ai-insights': '/analytics/ai-insights',
  };

  const handleSegmentChange = (value: AnalyticsSegment) => {
    router.replace(routes[value]);
  };

  const styles = createStyles(theme);

  return (
    <AnalyticsLayoutContext.Provider value={{ setScrollEnabled }}>
      <AnalyticsDataContext.Provider value={{ trades }}>
        <LoadingState isLoading={isLoading}>
          <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
            <ResponsiveContainer>
              <View style={styles.content}>
                <DateRangeFilter
                  selectedRange={selectedRange}
                  customRangeStart={customRangeStart}
                  customRangeEnd={customRangeEnd}
                  onSelectRange={setSelectedRange}
                  onSetCustomRange={setCustomRange}
                />

                {strategies.length > 0 && (
                  <StrategyFilter
                    strategies={strategies}
                    selectedStrategy={selectedStrategy}
                    onSelectStrategy={setSelectedStrategy}
                  />
                )}

                <AnalyticsTabs
                  tabs={segments}
                  activeValue={getSegment()}
                  onChange={(value) =>
                    handleSegmentChange(value as AnalyticsSegment)
                  }
                />

                {children ?? <Slot />}
              </View>
            </ResponsiveContainer>
          </ScrollView>
        </LoadingState>
      </AnalyticsDataContext.Provider>
    </AnalyticsLayoutContext.Provider>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
  });

export default AnalyticsLayout;
