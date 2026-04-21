import { Slot, usePathname, useRouter } from 'expo-router';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { LoadingState } from '../components/loading-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { SegmentedButtons } from '../components/segmented-buttons';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTradesInRange } from '../hooks/use-trades';
import { useAnalyticsStore } from '../store/analytics-store';
import { AnalyticsSegment, Trade } from '../types';
import { getDateRangeStart } from '../utils/date-range';
import { DateRangeFilter } from './analytics/date-range-filter';
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
    customRangeStart,
    customRangeEnd,
    selectedStrategy,
    setSelectedRange,
    setCustomRange,
    setSelectedStrategy,
  } = useAnalyticsStore();

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
    if (pathname.includes('/ai-insights')) return 'ai-insights';
    return 'overview';
  };

  const handleSegmentChange = (value: string) => {
    const routes: Record<AnalyticsSegment, string> = {
      overview: '/analytics',
      patterns: '/analytics/patterns',
      charts: '/analytics/charts',
      psychology: '/analytics/psychology',
      strategy: '/analytics/strategy',
      'ai-insights': '/analytics/ai-insights',
    };
    router.replace(routes[value as AnalyticsSegment]);
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

                <SegmentedButtons
                  value={getSegment()}
                  onValueChange={handleSegmentChange}
                  buttons={[
                    { value: 'overview', label: 'Overview' },
                    { value: 'patterns', label: 'Patterns' },
                    { value: 'charts', label: 'Charts' },
                    { value: 'psychology', label: 'Psych' },
                    { value: 'strategy', label: 'Strategy' },
                    { value: 'ai-insights', label: 'AI' },
                  ]}
                  style={styles.segmentToggle}
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
    segmentToggle: {
      marginBottom: 16,
    },
  });

export default AnalyticsLayout;
