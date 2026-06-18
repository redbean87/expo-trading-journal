import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useServiceWorker() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker
      .register('/sw.js', { type: 'module' })
      .catch((err: Error) => {
        console.warn('Service worker registration failed:', err);
      });
  }, []);
}
