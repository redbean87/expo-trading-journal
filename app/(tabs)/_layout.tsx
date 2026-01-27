import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DesktopSidebar } from '../../src/components/desktop-sidebar';
import { useAppTheme } from '../../src/hooks/use-app-theme';
import {
  getTabBarStyle,
  useNavigationMode,
} from '../../src/hooks/use-navigation-mode';

export default function TabLayout() {
  const theme = useAppTheme();
  const mode = useNavigationMode();
  const isSidebar = mode === 'sidebar';

  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: getTabBarStyle(
          isSidebar,
          theme.colors.surface,
          theme.colors.border
        ),
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

  if (isSidebar) {
    return (
      <View style={styles.desktopContainer}>
        <DesktopSidebar />
        <View style={styles.content}>{tabs}</View>
      </View>
    );
  }

  return tabs;
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
