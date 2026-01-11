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
  plugins: ['expo-router'],
  extra: {
    apiUrl: process.env.API_URL,
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  },
});
