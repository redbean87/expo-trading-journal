/**
 * Window polyfill for React Native
 *
 * Convex client uses window.addEventListener for network status monitoring.
 * This polyfill provides no-op implementations for React Native where window
 * doesn't exist or doesn't have these methods.
 *
 * This file MUST be imported before any Convex imports.
 */
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  // Convex client uses window.addEventListener for network status
  // Provide a no-op implementation for React Native
  const g = global as unknown as {
    window?: {
      addEventListener?: () => void;
      removeEventListener?: () => void;
    };
  };

  if (typeof g.window !== 'undefined') {
    if (!g.window.addEventListener) {
      g.window.addEventListener = () => {};
    }
    if (!g.window.removeEventListener) {
      g.window.removeEventListener = () => {};
    }
  } else {
    g.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }
}
