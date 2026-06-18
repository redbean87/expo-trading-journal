import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { useAppTheme } from '@/hooks/use-app-theme';
import { useNetworkStatus } from '@/hooks/use-network-status';

export function OfflineBanner() {
  const theme = useAppTheme();
  const { isConnected } = useNetworkStatus();

  return (
    <Snackbar
      visible={isConnected === false}
      onDismiss={() => {}}
      duration={Number.POSITIVE_INFINITY}
      wrapperStyle={styles.wrapper}
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
      theme={{
        colors: {
          onSurface: theme.colors.onSurface,
          surface: theme.colors.surface,
        },
      }}
    >
      No internet connection
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bar: {
    borderBottomWidth: 1,
  },
});
