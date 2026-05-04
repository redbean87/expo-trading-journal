import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange
    );

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          const handleStateChange = () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              waitingWorkerRef.current = newWorker;
              setUpdateAvailable(true);
            }
          };

          newWorker.addEventListener('statechange', handleStateChange);
        });
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange
      );
    };
  }, []);

  const activateUpdate = useCallback(() => {
    setUpdateAvailable(false);
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage('SKIP_WAITING');
    }
  }, []);

  return { updateAvailable, activateUpdate };
}
