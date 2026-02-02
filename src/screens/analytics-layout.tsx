import { Slot, usePathname, useRouter } from 'expo-router';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

import { LoadingState } from '../components/loading-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTradesInRange } from '../hooks/use-trades';
import { useAnalyticsStore } from '../store/analytics-store';
import { AnalyticsSegment } from '../types';
import { getDateRangeStart } from '../utils/date-range';
import { DateRangeFilter } from './analytics/date-range-filter';

type AnalyticsLayoutContextValue = {
  setScrollEnabled: (enabled: boolean) => void;
};

const AnalyticsLayoutContext = createContext<AnalyticsLayoutContextValue>({
  setScrollEnabled: () => {},
});

export const useAnalyticsLayout = () => useContext(AnalyticsLayoutContext);

type AnalyticsLayoutProps = {
  children?: ReactNode;
};

export function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { selectedRange, setSelectedRange } = useAnalyticsStore();

  const startTime = getDateRangeStart(selectedRange);
  const { isLoading } = useTradesInRange(startTime);

  const getSegment = (): AnalyticsSegment => {
    if (pathname.includes('/timing')) return 'timing';
    if (pathname.includes('/charts')) return 'charts';
    if (pathname.includes('/psychology')) return 'psychology';
    return 'overview';
  };

  const handleSegmentChange = (value: string) => {
    const routes: Record<AnalyticsSegment, string> = {
      overview: '/analytics',
      timing: '/analytics/timing',
      charts: '/analytics/charts',
      psychology: '/analytics/psychology',
    };
    router.replace(routes[value as AnalyticsSegment]);
  };

  const styles = createStyles(theme);

  return (
    <AnalyticsLayoutContext.Provider value={{ setScrollEnabled }}>
      <LoadingState isLoading={isLoading}>
        <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
          <ResponsiveContainer>
            <View style={styles.content}>
              <DateRangeFilter
                selectedRange={selectedRange}
                onSelectRange={setSelectedRange}
              />

              <SegmentedButtons
                value={getSegment()}
                onValueChange={handleSegmentChange}
                buttons={[
                  { value: 'overview', label: 'Overview' },
                  { value: 'timing', label: 'Timing' },
                  { value: 'charts', label: 'Charts' },
                  { value: 'psychology', label: 'Psych' },
                ]}
                style={styles.segmentToggle}
              />

              {children ?? <Slot />}
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </LoadingState>
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
