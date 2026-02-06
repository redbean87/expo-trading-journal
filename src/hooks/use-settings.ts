import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import { useProfileStore } from '../store/profile-store';
import { useThemeStore } from '../store/theme-store';
import { useTimezoneStore } from '../store/timezone-store';
import { ThemeMode } from '../theme';
import { useAuth } from './use-auth';

export type CloudSettings = {
  themeMode: string | null;
  timezone: string | null;
  displayName: string | null;
  settingsUpdatedAt: number | null;
};

/**
 * Hook to query cloud settings
 * Returns null when not authenticated, undefined when loading
 */
export function useCloudSettings() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Only query when authenticated
  const data = useQuery(
    api.settings.getSettings,
    isAuthenticated ? {} : 'skip'
  );

  return {
    settings: data,
    isLoading: authLoading || (isAuthenticated && data === undefined),
    isAuthenticated,
  };
}

/**
 * Hook to update cloud settings
 */
export function useUpdateCloudSettings() {
  return useMutation(api.settings.updateSettings);
}

/**
 * Hook to update theme both locally and in cloud
 */
export function useUpdateTheme() {
  const { isAuthenticated } = useAuth();
  const { setThemeMode } = useThemeStore();
  const updateCloudSettings = useUpdateCloudSettings();

  return async (mode: ThemeMode) => {
    // Always update local (optimistic + offline support)
    await setThemeMode(mode);

    // Sync to cloud if authenticated
    if (isAuthenticated) {
      try {
        await updateCloudSettings({ themeMode: mode });
      } catch (error) {
        console.error('Failed to sync theme to cloud:', error);
        // Local state is already correct, just log the error
      }
    }
  };
}

/**
 * Hook to update timezone both locally and in cloud
 */
export function useUpdateTimezone() {
  const { isAuthenticated } = useAuth();
  const { setTimezone } = useTimezoneStore();
  const updateCloudSettings = useUpdateCloudSettings();

  return async (timezone: string) => {
    // Always update local (optimistic + offline support)
    await setTimezone(timezone);

    // Sync to cloud if authenticated
    if (isAuthenticated) {
      try {
        await updateCloudSettings({ timezone });
      } catch (error) {
        console.error('Failed to sync timezone to cloud:', error);
        // Local state is already correct, just log the error
      }
    }
  };
}

/**
 * Hook to update display name both locally and in cloud
 */
export function useUpdateDisplayName() {
  const { isAuthenticated } = useAuth();
  const { setDisplayName } = useProfileStore();
  const updateCloudSettings = useUpdateCloudSettings();

  return async (name: string | null) => {
    // Trim and validate locally before persisting
    const trimmed = name ? name.trim() : null;
    const normalized = trimmed === '' ? null : trimmed;

    // Validate max length
    if (normalized && normalized.length > 50) {
      throw new Error('Display name must be 50 characters or less');
    }

    // Always update local (optimistic + offline support)
    await setDisplayName(normalized);

    // Sync to cloud if authenticated
    if (isAuthenticated) {
      try {
        await updateCloudSettings({
          displayName: normalized ?? undefined,
        });
      } catch (error) {
        console.error('Failed to sync display name to cloud:', error);
        // Local state is already correct, just log the error
      }
    }
  };
}
