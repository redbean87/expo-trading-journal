import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { usePwaUpdateStore } from '@/store/pwa-update-store';

const UPDATE_INTERVAL_MS = 60_000;

function isProductionWeb(): boolean {
  return Platform.OS === 'web' && process.env.NODE_ENV === 'production';
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const response = await fetch(`/version.json?_=${Date.now()}`, {
      cache: 'no-cache',
    });
    if (!response.ok) return null;
    const data = (await response.json()) as unknown;
    if (
      data &&
      typeof data === 'object' &&
      'version' in data &&
      typeof data.version === 'string'
    ) {
      return data.version;
    }
    return null;
  } catch {
    return null;
  }
}

export function useServiceWorker() {
  const setUpdateAvailable = usePwaUpdateStore(
    (state) => state.setUpdateAvailable
  );
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const lastCheckRef = useRef<number>(0);
  const runningVersionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isProductionWeb()) return;
    if (!('serviceWorker' in navigator)) return;

    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

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

    const checkVersion = async () => {
      const latestVersion = await fetchLatestVersion();
      if (!mounted || !latestVersion) return;

      if (runningVersionRef.current === null) {
        runningVersionRef.current = latestVersion;
        return;
      }

      if (latestVersion !== runningVersionRef.current) {
        registrationRef.current?.update().catch(() => {});
        setUpdateAvailable(true);
      }
    };

    const runUpdateChecks = () => {
      if (!mounted) return;
      lastCheckRef.current = Date.now();
      registrationRef.current?.update().catch(() => {});
      void checkVersion();
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

        void checkVersion();
      })
      .catch((err: Error) => {
        console.warn('Service worker registration failed:', err);
      });

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastCheckRef.current > UPDATE_INTERVAL_MS
      ) {
        runUpdateChecks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        runUpdateChecks();
      }
    }, UPDATE_INTERVAL_MS);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      navigator.serviceWorker?.removeEventListener(
        'controllerchange',
        handleControllerChange
      );
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [setUpdateAvailable]);
}
