import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@/hooks/use-app-theme';
import { usePendingDuplicatePairs } from '@/hooks/use-duplicate-detection';
import { getTabBarStyle, useNavigationMode } from '@/hooks/use-navigation-mode';
import { useTrades } from '@/hooks/use-trades';

export default function TabLayout() {
  const theme = useAppTheme();
  const mode = useNavigationMode();
  const isSidebar = mode === 'sidebar';
  const { trades } = useTrades();
  const duplicatePairs = usePendingDuplicatePairs(trades);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: getTabBarStyle(
          isSidebar,
          theme.colors.surface,
          theme.colors.border
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          title: 'Trades',
          tabBarBadge:
            duplicatePairs.length > 0 ? duplicatePairs.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.error,
            color: theme.colors.onError,
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
