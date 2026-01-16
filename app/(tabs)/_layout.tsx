import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAppTheme } from '../../src/hooks/use-app-theme';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
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
        name="add-trade"
        options={{
          title: 'Add Trade',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-circle"
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
