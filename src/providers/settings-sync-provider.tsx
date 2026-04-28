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

import type { CustomColors } from '../types';

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
  const {
    displayName,
    defaultRiskPercent,
    setFromCloud: setDisplayNameFromCloud,
    setDefaultRiskPercentFromCloud,
  } = useProfileStore();
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

    if (cloudSettings === null) {
      // Full migration: cloud has no settings at all
      updateCloudSettings({
        themeMode: themeMode,
        timezone: timezone,
        displayName: displayName ?? undefined,
        defaultRiskPercent: defaultRiskPercent ?? undefined,
        customThemePreset: preset,
        customColors: customColors ? JSON.stringify(customColors) : undefined,
      }).catch((error) => {
        console.error('Failed to migrate settings to cloud:', error);
      });
      return;
    }

    // Granular backfill: upload local settings that are missing from cloud
    const updates: Parameters<typeof updateCloudSettings>[0] = {};

    if (cloudSettings.themeMode === null && themeMode !== null) {
      updates.themeMode = themeMode;
    }
    if (cloudSettings.timezone === null && timezone !== null) {
      updates.timezone = timezone;
    }
    if (cloudSettings.displayName === null && displayName !== null) {
      updates.displayName = displayName;
    }
    if (
      cloudSettings.defaultRiskPercent === null &&
      defaultRiskPercent !== null
    ) {
      updates.defaultRiskPercent = defaultRiskPercent;
    }
    if (cloudSettings.customThemePreset === null && preset !== null) {
      updates.customThemePreset = preset;
      if (customColors) {
        updates.customColors = JSON.stringify(customColors);
      }
    }

    if (Object.keys(updates).length > 0) {
      updateCloudSettings(updates).catch((error) => {
        console.error('Failed to backfill missing cloud settings:', error);
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    cloudSettings,
    themeMode,
    timezone,
    displayName,
    defaultRiskPercent,
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

    // Apply default risk percent from cloud if it exists
    if (cloudSettings.defaultRiskPercent !== undefined) {
      setDefaultRiskPercentFromCloud(cloudSettings.defaultRiskPercent);
    }

    // Apply custom theme from cloud
    if (cloudSettings.customThemePreset === 'custom') {
      let parsedColors: CustomColors | null = null;

      if (cloudSettings.customColors) {
        try {
          const raw = JSON.parse(cloudSettings.customColors);
          // Backfill defaults for old data missing selectedBackground/selectedText
          parsedColors = {
            ...raw,
            selectedBackground: raw.selectedBackground || '#EADDFF',
            selectedText: raw.selectedText || '#21005D',
          };
        } catch (error) {
          console.error('Failed to parse custom colors from cloud:', error);
        }
      }

      setCustomThemeFromCloud('custom', parsedColors);
    } else if (cloudSettings.customThemePreset === 'default') {
      setCustomThemeFromCloud('default', null);
    }
  }, [
    isAuthenticated,
    isLoading,
    cloudSettings,
    setThemeFromCloud,
    setTimezoneFromCloud,
    setDisplayNameFromCloud,
    setDefaultRiskPercentFromCloud,
    setCustomThemeFromCloud,
  ]);

  return <>{children}</>;
}
