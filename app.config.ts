import 'dotenv/config';

import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Trading Journal',
  slug: 'expo-trading-journal',
  version: '1.0.0',
  scheme: 'trading-journal',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#6200ee',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tradingjournal.app',
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        'We need access to your photo library to attach trade screenshots.',
      NSCameraUsageDescription:
        'We need access to your camera to capture trade screenshots.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#6200ee',
    },
    package: 'com.tradingjournal.app',
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-image-picker'],
  extra: {
    apiUrl: process.env.API_URL,
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    eas: {
      projectId: 'a2951e1c-afb8-4234-94f0-b1230eade206',
    },
  },
});
