import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/use-app-theme';
import { spacing } from '../theme';

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
    matchPaths: ['/(tabs)/trades', '/trades'],
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

  const isActive = (item: SidebarItem) => item.matchPaths.includes(pathname);

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
                  active ? theme.colors.primary : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: active
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                  active && styles.activeLabel,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
  },
  nav: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
  },
  label: {
    marginLeft: spacing.md,
    fontSize: 14,
  },
  activeLabel: {
    fontWeight: '600',
  },
});
