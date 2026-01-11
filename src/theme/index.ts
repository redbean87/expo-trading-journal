import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export type ThemeMode = 'light' | 'dark';

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
