import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type WorkboxInstance = InstanceType<typeof import('workbox-window').Workbox>;

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const wbRef = useRef<WorkboxInstance | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator)) return;

    let mounted = true;

    import('workbox-window').then(({ Workbox }) => {
      if (!mounted) return;

      const wb = new Workbox('/sw.js');

      wb.addEventListener('waiting', () => {
        if (mounted) setUpdateAvailable(true);
      });

      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      wb.register().catch((err: Error) => {
        console.warn('Service worker registration failed:', err);
      });

      wbRef.current = wb;
    });

    return () => {
      mounted = false;
    };
  }, []);

  const activateUpdate = useCallback(() => {
    setUpdateAvailable(false);
    if (wbRef.current) {
      wbRef.current.messageSkipWaiting();
    }
  }, []);

  return { updateAvailable, activateUpdate };
}
