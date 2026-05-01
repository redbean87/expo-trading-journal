import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

import { useAppTheme } from '../hooks/use-app-theme';

type TabItem = {
  value: string;
  label: string;
};

type AnalyticsTabsProps = {
  tabs: TabItem[];
  activeValue: string;
  onChange: (value: string) => void;
};

export function AnalyticsTabs({
  tabs,
  activeValue,
  onChange,
}: AnalyticsTabsProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeValue;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => onChange(tab.value)}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              <View
                style={[styles.indicator, !isActive && styles.indicatorHidden]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.divider} />
    </View>
  );
}

const INDICATOR_HEIGHT = 2;

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    tabBar: {
      flexDirection: 'row',
    },
    tab: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 56,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      paddingBottom: theme.spacing.sm,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    indicator: {
      height: INDICATOR_HEIGHT,
      backgroundColor: theme.colors.primary,
      alignSelf: 'stretch',
      borderTopLeftRadius: INDICATOR_HEIGHT / 2,
      borderTopRightRadius: INDICATOR_HEIGHT / 2,
    },
    indicatorHidden: {
      backgroundColor: 'transparent',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });
