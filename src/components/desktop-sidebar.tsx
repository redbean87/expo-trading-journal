import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/use-app-theme';
import { useDuplicateDetection } from '../hooks/use-duplicate-detection';
import { useTrades } from '../hooks/use-trades';

type SidebarItem = {
  route: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  matchPaths: string[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    route: '/(tabs)',
    label: 'Home',
    icon: 'home',
    matchPaths: ['/', '/(tabs)', '/(tabs)/index'],
  },
  {
    route: '/(tabs)/trades',
    label: 'Trades',
    icon: 'format-list-bulleted',
    matchPaths: ['/(tabs)/trades', '/trades', '/add-trade'],
  },
  {
    route: '/(tabs)/analytics',
    label: 'Analytics',
    icon: 'chart-line',
    matchPaths: ['/(tabs)/analytics', '/analytics'],
  },
  {
    route: '/(tabs)/profile',
    label: 'Profile',
    icon: 'account-circle',
    matchPaths: ['/(tabs)/profile', '/profile'],
  },
];

const ICON_SIZE = 24;
export const SIDEBAR_WIDTH = 240;

export function DesktopSidebar() {
  const theme = useAppTheme();
  const pathname = usePathname();
  const router = useRouter();
  const styles = createStyles(theme);
  const { trades } = useTrades();
  const duplicatePairs = useDuplicateDetection(trades);

  const isActive = (item: SidebarItem) =>
    item.matchPaths.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRightColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.nav}>
        {SIDEBAR_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Pressable
              key={item.route}
              style={[
                styles.item,
                active && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => router.replace(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={ICON_SIZE}
                color={
                  active
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.textSecondary
                }
              />
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: active
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.textSecondary,
                    },
                    active && styles.activeLabel,
                  ]}
                >
                  {item.label}
                </Text>
                {item.label === 'Trades' && duplicatePairs.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {duplicatePairs.length}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      width: SIDEBAR_WIDTH,
      borderRightWidth: 1,
    },
    nav: {
      paddingTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.spacing.sm,
    },
    labelContainer: {
      flex: 1,
      position: 'relative',
      marginLeft: theme.spacing.md,
    },
    label: {
      fontSize: 14,
    },
    activeLabel: {
      fontWeight: '600',
    },
    badge: {
      position: 'absolute',
      top: -8,
      right: 0,
      backgroundColor: theme.colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: theme.colors.onError,
      fontSize: 12,
      fontWeight: '600',
    },
  });
