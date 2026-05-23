import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';

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
    maxWidth: 1440,
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

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

export const iconSizes = {
  sm: 24,
  md: 48,
  lg: 64,
} as const;

export const elevation = {
  0: {
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  1: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  2: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  3: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type BorderRadius = typeof borderRadius;
export type Elevation = typeof elevation;
export type IconSizes = typeof iconSizes;

// Custom Typography Variants
// Extends MD3 typescale with app-specific typography
export const customTypography = {
  // Chart-specific typography for data visualization
  chartLabel: {
    fontSize: 9,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 12,
  },
  chartAxis: {
    fontSize: 10,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 14,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 15,
  },
  // Value display typography for P&L and stats
  profitLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  lossLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  // Meta text for secondary information
  metaText: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  // Section titles with primary color
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
} as const;

export type CustomTypography = typeof customTypography;

const customColors = {
  profit: '#4caf50',
  loss: '#f44336',
};

const lightColors = {
  ...customColors,
  error: '#B3261E',
  onError: '#ffffff',
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
  textSecondary: '#757575',
  textTertiary: '#9e9e9e',
  border: '#e0e0e0',
  // Chip and tab colors (match MD3 light theme defaults)
  chipSelectedBackground: '#EADDFF', // MD3 primaryContainer
  chipSelectedText: '#21005D', // MD3 onPrimaryContainer
  tabSelectedBackground: '#EADDFF', // MD3 primaryContainer
  tabSelectedText: '#21005D', // MD3 onPrimaryContainer
};

const darkColors = {
  ...customColors,
  error: '#B3261E',
  onError: '#ffffff',
  background: '#121212',
  surface: '#1e1e1e',
  surfaceVariant: '#2c2c2c',
  textSecondary: '#a0a0a0',
  textTertiary: '#707070',
  border: '#3c3c3c',
  // Chip and tab colors (match MD3 dark theme defaults)
  chipSelectedBackground: '#4A4458', // MD3 dark theme primaryContainer
  chipSelectedText: '#EADDFF', // MD3 dark theme onPrimaryContainer
  tabSelectedBackground: '#4A4458', // MD3 dark theme primaryContainer
  tabSelectedText: '#EADDFF', // MD3 dark theme onPrimaryContainer
};

// Configure fonts with custom typography variants
const configureAppFonts = (baseFonts: typeof MD3LightTheme.fonts) => {
  return configureFonts({
    config: {
      ...baseFonts,
      ...customTypography,
    },
  });
};

const designTokens = {
  spacing,
  borderRadius,
  elevation,
  iconSizes,
};

export const lightTheme = {
  ...MD3LightTheme,
  ...designTokens,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: lightColors.surface,
      level2: lightColors.surface,
      level3: lightColors.surfaceVariant,
      level4: lightColors.surfaceVariant,
      level5: lightColors.surfaceVariant,
    },
  },
  fonts: configureAppFonts(MD3LightTheme.fonts),
};

export const darkTheme = {
  ...MD3DarkTheme,
  ...designTokens,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: darkColors.surface,
      level2: darkColors.surface,
      level3: darkColors.surfaceVariant,
      level4: darkColors.surfaceVariant,
      level5: darkColors.surfaceVariant,
    },
  },
  fonts: configureAppFonts(MD3DarkTheme.fonts),
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
  selectedBackground: '#EADDFF', // MD3 primaryContainer (light purple)
  selectedText: '#21005D', // MD3 onPrimaryContainer (dark purple)
};

export function createCustomTheme(
  baseTheme: typeof lightTheme | typeof darkTheme,
  customColors: CustomColors | null,
  _mode: ThemeMode
): AppTheme {
  if (!customColors) {
    return baseTheme;
  }

  const selectedBg =
    customColors.selectedBackground || baseTheme.colors.primaryContainer;
  const selectedTxt =
    customColors.selectedText || baseTheme.colors.onPrimaryContainer;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: customColors.primary,
      profit: customColors.profit,
      loss: customColors.loss,
      // Apply consolidated selected colors to all active/selected states
      primaryContainer: selectedBg,
      onPrimaryContainer: selectedTxt,
      chipSelectedBackground: selectedBg,
      chipSelectedText: selectedTxt,
      tabSelectedBackground: selectedBg,
      tabSelectedText: selectedTxt,
    },
  };
}
