import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';

import { useAppTheme } from '@/hooks/use-app-theme';
import { usePwaUpdateStore } from '@/store/pwa-update-store';

export function UpdateBanner() {
  const theme = useAppTheme();
  const { updateAvailable, setUpdateAvailable } = usePwaUpdateStore();

  const activateUpdate = () => {
    setUpdateAvailable(false);
    if (!('serviceWorker' in navigator)) {
      window.location.reload();
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
      })
      .catch(() => {
        window.location.reload();
      });
  };

  return (
    <Portal>
      <Snackbar
        visible={updateAvailable}
        onDismiss={() => {}}
        duration={Number.POSITIVE_INFINITY}
        wrapperStyle={styles.wrapper}
        style={[
          styles.bar,
          {
            backgroundColor: theme.colors.inverseSurface,
            borderTopColor: theme.colors.border,
          },
        ]}
        theme={{
          colors: {
            onSurface: theme.colors.inverseOnSurface,
            surface: theme.colors.inverseSurface,
          },
        }}
        action={{
          label: 'Update',
          onPress: activateUpdate,
          labelStyle: { color: theme.colors.inversePrimary },
        }}
      >
        A new version is available
      </Snackbar>
    </Portal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bar: {
    borderTopWidth: 1,
  },
});
