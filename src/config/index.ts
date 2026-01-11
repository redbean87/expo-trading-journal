import Constants from 'expo-constants';

type Config = {
  apiUrl: string | null;
  enableAnalytics: boolean;
  isDev: boolean;
};

const extra = Constants.expoConfig?.extra ?? {};

export const config: Config = {
  apiUrl: extra.apiUrl ?? null,
  enableAnalytics: extra.enableAnalytics ?? false,
  isDev: __DEV__,
};
