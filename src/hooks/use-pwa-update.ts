import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type WorkboxInstance = InstanceType<typeof import('workbox-window').Workbox>;

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const wbRef = useRef<WorkboxInstance | null>(null);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

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

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && wbRef.current) {
          const now = Date.now();
          if (now - lastCheckRef.current > 60_000) {
            lastCheckRef.current = now;
            wbRef.current.update();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
      };
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
