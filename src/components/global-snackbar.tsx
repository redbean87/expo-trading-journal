import React from 'react';
import { Portal, Snackbar } from 'react-native-paper';

import { useSnackbarStore } from '@/store/snackbar-store';

export function GlobalSnackbar() {
  const { visible, message, action, duration, hide } = useSnackbarStore();

  return (
    <Portal>
      <Snackbar
        visible={visible}
        onDismiss={hide}
        duration={duration}
        action={
          action
            ? {
                label: action.label,
                onPress: () => {
                  action.onPress();
                  hide();
                },
              }
            : undefined
        }
      >
        {message}
      </Snackbar>
    </Portal>
  );
}
