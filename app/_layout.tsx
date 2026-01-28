// Polyfill must be imported first, before any Convex imports
import '../src/polyfills/window-polyfill';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';

import AuthGate from '../src/components/auth-gate';
import { ErrorBoundary } from '../src/components/error-boundary';
import { SidebarLayout } from '../src/components/sidebar-layout';
import { ConvexProvider } from '../src/providers/convex-provider';
import { SettingsSyncProvider } from '../src/providers/settings-sync-provider';
import { useThemeStore } from '../src/store/theme-store';
import { useTimezoneStore } from '../src/store/timezone-store';
import {
  lightTheme,
  darkTheme,
  lightNavigationTheme,
  darkNavigationTheme,
} from '../src/theme';

// Register locale for date picker
registerTranslation('en', enGB);

export default function RootLayout() {
  const { themeMode, loadTheme } = useThemeStore();
  const { loadTimezone } = useTimezoneStore();

  useEffect(() => {
    loadTheme();
    loadTimezone();
  }, []);

  const paperTheme = themeMode === 'dark' ? darkTheme : lightTheme;
  const navigationTheme =
    themeMode === 'dark' ? darkNavigationTheme : lightNavigationTheme;

  return (
    <ErrorBoundary>
      <ConvexProvider>
        <SettingsSyncProvider>
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navigationTheme}>
              <AuthGate>
                <SidebarLayout>
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="trade/[id]"
                      options={{ headerShown: true }}
                    />
                    <Stack.Screen
                      name="add-trade"
                      options={{ headerShown: true, title: 'Add Trade' }}
                    />
                    <Stack.Screen
                      name="edit-trade/[id]"
                      options={{ headerShown: true, title: 'Edit Trade' }}
                    />
                    <Stack.Screen
                      name="auth/callback"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </SidebarLayout>
              </AuthGate>
              <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            </ThemeProvider>
          </PaperProvider>
        </SettingsSyncProvider>
      </ConvexProvider>
    </ErrorBoundary>
  );
}
