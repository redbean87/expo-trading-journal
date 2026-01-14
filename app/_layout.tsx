// Polyfill must be imported first, before any Convex imports
import '../src/polyfills/window-polyfill';

import { ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';

import AuthGate from '../src/components/auth-gate';
import { ErrorBoundary } from '../src/components/error-boundary';
import { ConvexProvider } from '../src/providers/convex-provider';
import { useThemeStore } from '../src/store/theme-store';
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

  useEffect(() => {
    loadTheme();
  }, []);

  const paperTheme = themeMode === 'dark' ? darkTheme : lightTheme;
  const navigationTheme =
    themeMode === 'dark' ? darkNavigationTheme : lightNavigationTheme;

  return (
    <ErrorBoundary>
      <ConvexProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <AuthGate>
              <Slot />
            </AuthGate>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </PaperProvider>
      </ConvexProvider>
    </ErrorBoundary>
  );
}
