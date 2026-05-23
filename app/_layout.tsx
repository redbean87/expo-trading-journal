// Polyfill must be imported first, before any Convex imports
import '@/polyfills/window-polyfill';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';

import AuthGate from '@/components/auth-gate';
import { ErrorBoundary } from '@/components/error-boundary';
import { PwaUpdatePrompt } from '@/components/pwa-update-prompt';
import { SidebarLayout } from '@/components/sidebar-layout';
import { TagLibraryInitializer } from '@/components/tag-library-initializer';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ConvexProvider } from '@/providers/convex-provider';
import { SettingsSyncProvider } from '@/providers/settings-sync-provider';
import { useCustomThemeStore } from '@/store/custom-theme-store';
import { useProfileStore } from '@/store/profile-store';
import { useThemeStore } from '@/store/theme-store';
import { useTimeFilterStore } from '@/store/time-filter-store';
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

export default function RootLayout() {
  const { themeMode, loadTheme } = useThemeStore();
  const { preset, customColors, loadCustomTheme } = useCustomThemeStore();
  const { loadTimezone } = useTimezoneStore();
  const { loadProfile, defaultTimeRange } = useProfileStore();
  const { loadTimeFilter } = useTimeFilterStore();

  useEffect(() => {
    loadTheme();
    loadCustomTheme();
    loadTimezone();
    loadProfile();
    loadTimeFilter(defaultTimeRange ?? undefined);
  }, [
    loadTheme,
    loadCustomTheme,
    loadTimezone,
    loadProfile,
    loadTimeFilter,
    defaultTimeRange,
  ]);

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
                <TagLibraryInitializer />
                <KeyboardShortcutsHandler />
                <PwaUpdatePrompt />
                <SidebarLayout>
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="add-trade"
                      options={{
                        headerShown: false,
                        presentation: 'modal',
                      }}
                    />
                    <Stack.Screen
                      name="auth/callback"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="duplicate-review"
                      options={{
                        headerShown: false,
                        presentation: 'modal',
                      }}
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
