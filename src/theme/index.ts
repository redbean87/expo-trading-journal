import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

import type { CustomColors } from '../types';

export type ThemeMode = 'light' | 'dark';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const layout = {
  breakpoints: {
    tablet: 768,
    desktop: 1024,
  },
  container: {
    maxWidth: 1200,
  },
  grid: {
    gap: 12,
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 4,
    },
  },
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;

const customColors = {
  profit: '#4caf50',
  loss: '#f44336',
};

const lightColors = {
  ...customColors,
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
  textSecondary: '#757575',
  textTertiary: '#9e9e9e',
  border: '#e0e0e0',
};

const darkColors = {
  ...customColors,
  background: '#121212',
  surface: '#1e1e1e',
  surfaceVariant: '#2c2c2c',
  textSecondary: '#a0a0a0',
  textTertiary: '#707070',
  border: '#3c3c3c',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};

export const lightNavigationTheme: NavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: lightColors.background,
    card: lightColors.surface,
    border: lightColors.border,
  },
};

export const darkNavigationTheme: NavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: darkColors.background,
    card: darkColors.surface,
    border: darkColors.border,
  },
};

export type AppTheme = typeof lightTheme;

// Default color values (for reference and testing only)
// Note: In practice, defaults come from the current theme (light/dark) in ProfileScreen
export const DEFAULT_CUSTOM_COLORS = {
  primary: '#6750A4', // MD3 purple
  profit: '#4caf50', // Green
  loss: '#f44336', // Red
  primaryContainer: '#EADDFF', // MD3 light theme default (light purple)
  onPrimaryContainer: '#21005D', // MD3 dark purple for text on light purple
};

export function createCustomTheme(
  baseTheme: typeof lightTheme | typeof darkTheme,
  customColors: CustomColors | null,
  _mode: ThemeMode
): AppTheme {
  if (!customColors) {
    return baseTheme;
  }

  // Only apply accent colors, leave background/surface/text to base theme
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: customColors.primary,
      profit: customColors.profit,
      loss: customColors.loss,
      // Only override if provided, otherwise use base theme values
      ...(customColors.primaryContainer && {
        primaryContainer: customColors.primaryContainer,
      }),
      ...(customColors.onPrimaryContainer && {
        onPrimaryContainer: customColors.onPrimaryContainer,
      }),
    },
  };
}
