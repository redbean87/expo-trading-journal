import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

function getInitialConnectedState(): boolean {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(
    getInitialConnectedState()
  );

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        setIsConnected(state.isConnected ?? false);
      });

      NetInfo.fetch().then((state: NetInfoState) => {
        setIsConnected(state.isConnected ?? false);
      });

      return () => {
        unsubscribe();
      };
    }

    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isConnected };
}
