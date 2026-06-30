import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { usePwaUpdateStore } from '@/store/pwa-update-store';

const UPDATE_INTERVAL_MS = 60_000;

function isProductionWeb(): boolean {
  return Platform.OS === 'web' && process.env.NODE_ENV === 'production';
}

export function useServiceWorker() {
  const setUpdateAvailable = usePwaUpdateStore(
    (state) => state.setUpdateAvailable
  );
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (!isProductionWeb()) return;
    if (!('serviceWorker' in navigator)) return;

    let mounted = true;

    const handleInstalled = (registration: ServiceWorkerRegistration) => {
      const installing = registration.installing;
      if (!installing) return;

      const onStateChange = () => {
        if (!mounted) return;
        if (
          installing.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          setUpdateAvailable(true);
        }
      };

      installing.addEventListener('statechange', onStateChange);
      onStateChange();
    };

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (!mounted) return;
        registrationRef.current = registration;

        registration.addEventListener('updatefound', () => {
          handleInstalled(registration);
        });
        handleInstalled(registration);

        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }

        navigator.serviceWorker.addEventListener(
          'controllerchange',
          handleControllerChange
        );
      })
      .catch((err: Error) => {
        console.warn('Service worker registration failed:', err);
      });

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        registrationRef.current &&
        Date.now() - lastCheckRef.current > UPDATE_INTERVAL_MS
      ) {
        lastCheckRef.current = Date.now();
        registrationRef.current.update().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      navigator.serviceWorker?.removeEventListener(
        'controllerchange',
        handleControllerChange
      );
    };
  }, [setUpdateAvailable]);
}
