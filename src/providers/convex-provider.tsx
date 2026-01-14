import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';

import { createApiTradeService } from '../services/api-trade-service';
import { setApiService } from '../services/trade-service';

const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error writing to secure storage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  },
};

const getStorage = () => {
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    window.localStorage
  ) {
    return window.localStorage;
  }
  return secureStorage;
};

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    'Missing EXPO_PUBLIC_CONVEX_URL environment variable.\n' +
      'Run `npx convex dev` to get your deployment URL and add it to .env:\n' +
      'EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud'
  );
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

type ConvexProviderProps = {
  children: ReactNode;
};

export function ConvexProvider({ children }: ConvexProviderProps) {
  useEffect(() => {
    const apiService = createApiTradeService(convex);
    setApiService(apiService);
  }, []);

  return (
    <ConvexAuthProvider client={convex} storage={getStorage()}>
      {children}
    </ConvexAuthProvider>
  );
}
