// Polyfill must be imported first, before any Convex imports
import '@/polyfills/window-polyfill';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';

import AuthGate from '@/components/auth-gate';
import { ErrorBoundary } from '@/components/error-boundary';
import { SidebarLayout } from '@/components/sidebar-layout';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ConvexProvider } from '@/providers/convex-provider';
import { SettingsSyncProvider } from '@/providers/settings-sync-provider';
import { useCustomThemeStore } from '@/store/custom-theme-store';
import { useProfileStore } from '@/store/profile-store';
import { useThemeStore } from '@/store/theme-store';
import { useTimezoneStore } from '@/store/timezone-store';
import {
  lightTheme,
  darkTheme,
  lightNavigationTheme,
  darkNavigationTheme,
  createCustomTheme,
} from '@/theme';

// Register locale for date picker
registerTranslation('en', enGB);

function KeyboardShortcutsHandler() {
  useKeyboardShortcuts();
  return null;
}

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => console.warn('Service worker registration failed:', err));
  }, []);
  return null;
}

export default function RootLayout() {
  const { themeMode, loadTheme } = useThemeStore();
  const { preset, customColors, loadCustomTheme } = useCustomThemeStore();
  const { loadTimezone } = useTimezoneStore();
  const { loadProfile } = useProfileStore();

  useEffect(() => {
    loadTheme();
    loadCustomTheme();
    loadTimezone();
    loadProfile();
  }, [loadTheme, loadCustomTheme, loadTimezone, loadProfile]);

  const baseTheme = themeMode === 'dark' ? darkTheme : lightTheme;
  const paperTheme =
    preset === 'custom'
      ? createCustomTheme(baseTheme, customColors, themeMode)
      : baseTheme;
  const navigationTheme =
    themeMode === 'dark' ? darkNavigationTheme : lightNavigationTheme;

  return (
    <ErrorBoundary>
      <ConvexProvider>
        <SettingsSyncProvider>
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navigationTheme}>
              <AuthGate>
                <KeyboardShortcutsHandler />
                <ServiceWorkerRegistrar />
                <SidebarLayout>
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="add-trade"
                      options={{
                        headerShown: true,
                        title: 'Add Trade',
                        presentation: 'modal',
                      }}
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
