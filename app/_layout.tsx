import { ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

import { ErrorBoundary } from '../src/components/error-boundary';
import { QueryProvider } from '../src/providers/query-provider';
import { useThemeStore } from '../src/store/theme-store';
import {
  lightTheme,
  darkTheme,
  lightNavigationTheme,
  darkNavigationTheme,
} from '../src/theme';

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
      <QueryProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <Slot />
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </PaperProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
