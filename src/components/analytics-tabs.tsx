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
        contentContainerStyle={styles.content}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeValue;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => onChange(tab.value)}
              activeOpacity={0.7}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.bottomBorder} />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    content: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 4,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
      minWidth: 64,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    tabTextActive: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    bottomBorder: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginTop: 8,
      opacity: 0.5,
    },
  });
