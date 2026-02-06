import { ReactNode, useEffect, useRef } from 'react';

import {
  useCloudSettings,
  useUpdateCloudSettings,
} from '../hooks/use-settings';
import { useCustomThemeStore } from '../store/custom-theme-store';
import { useProfileStore } from '../store/profile-store';
import { useThemeStore } from '../store/theme-store';
import { useTimezoneStore } from '../store/timezone-store';
import { ThemeMode } from '../theme';

import type { CustomColors, CustomThemePreset } from '../types';

type SettingsSyncProviderProps = {
  children: ReactNode;
};

/**
 * Provider that syncs user settings between local storage and cloud
 *
 * Sync strategy:
 * - On app start: Load from AsyncStorage first (instant UI)
 * - On authentication: Fetch cloud settings
 *   - If cloud is empty: Upload local settings (one-time migration)
 * - Real-time sync: Apply cloud settings whenever they change (from any device)
 * - On setting change: Update local + sync to cloud (handled by hooks)
 */
export function SettingsSyncProvider({ children }: SettingsSyncProviderProps) {
  const {
    settings: cloudSettings,
    isLoading,
    isAuthenticated,
  } = useCloudSettings();
  const updateCloudSettings = useUpdateCloudSettings();

  const { themeMode, setFromCloud: setThemeFromCloud } = useThemeStore();
  const { timezone, setFromCloud: setTimezoneFromCloud } = useTimezoneStore();
  const { displayName, setFromCloud: setDisplayNameFromCloud } =
    useProfileStore();
  const {
    preset,
    customColors,
    setFromCloud: setCustomThemeFromCloud,
  } = useCustomThemeStore();

  // Track if we've done the initial migration check (one-time per auth session)
  const hasMigratedRef = useRef(false);

  // One-time migration: upload local settings to cloud if cloud is empty
  useEffect(() => {
    if (!isAuthenticated) {
      hasMigratedRef.current = false;
      return;
    }

    if (isLoading || cloudSettings === undefined || hasMigratedRef.current) {
      return;
    }

    hasMigratedRef.current = true;

    // Check if cloud has any settings
    const hasCloudSettings =
      cloudSettings !== null &&
      (cloudSettings.themeMode !== null ||
        cloudSettings.timezone !== null ||
        cloudSettings.displayName !== null ||
        cloudSettings.customThemePreset !== null);

    if (!hasCloudSettings) {
      // Cloud is empty - upload local settings (migration)
      updateCloudSettings({
        themeMode: themeMode,
        timezone: timezone,
        displayName: displayName ?? undefined,
        customThemePreset: preset,
        customColors: customColors ? JSON.stringify(customColors) : undefined,
      }).catch((error) => {
        console.error('Failed to migrate settings to cloud:', error);
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    cloudSettings,
    themeMode,
    timezone,
    displayName,
    preset,
    customColors,
    updateCloudSettings,
  ]);

  // Real-time sync: apply cloud settings whenever they change
  useEffect(() => {
    if (
      !isAuthenticated ||
      isLoading ||
      cloudSettings === undefined ||
      cloudSettings === null
    ) {
      return;
    }

    // Apply theme from cloud if it's valid
    if (
      cloudSettings.themeMode === 'light' ||
      cloudSettings.themeMode === 'dark'
    ) {
      setThemeFromCloud(cloudSettings.themeMode as ThemeMode);
    }

    // Apply timezone from cloud if it exists
    if (cloudSettings.timezone) {
      setTimezoneFromCloud(cloudSettings.timezone);
    }

    // Apply display name from cloud if it exists
    if (cloudSettings.displayName !== undefined) {
      setDisplayNameFromCloud(cloudSettings.displayName);
    }

    // Apply custom theme from cloud
    if (cloudSettings.customThemePreset) {
      const themePreset = cloudSettings.customThemePreset as CustomThemePreset;
      let parsedColors: CustomColors | null = null;

      if (cloudSettings.customColors) {
        try {
          parsedColors = JSON.parse(cloudSettings.customColors);
        } catch (error) {
          console.error('Failed to parse custom colors from cloud:', error);
        }
      }

      setCustomThemeFromCloud(themePreset, parsedColors);
    }
  }, [
    isAuthenticated,
    isLoading,
    cloudSettings,
    setThemeFromCloud,
    setTimezoneFromCloud,
    setDisplayNameFromCloud,
    setCustomThemeFromCloud,
  ]);

  return <>{children}</>;
}
