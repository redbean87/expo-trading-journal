import { Snackbar, Portal } from 'react-native-paper';

import { useAppTheme } from '@/hooks/use-app-theme';
import { usePwaUpdate } from '@/hooks/use-pwa-update';

export function PwaUpdatePrompt() {
  const theme = useAppTheme();
  const { updateAvailable, activateUpdate } = usePwaUpdate();

  if (!updateAvailable) return null;

  return (
    <Portal>
      <Snackbar
        visible={updateAvailable}
        onDismiss={() => {}}
        duration={0}
        action={{
          label: 'Update',
          onPress: activateUpdate,
          labelStyle: { color: theme.colors.primary },
        }}
      >
        A new version is available
      </Snackbar>
    </Portal>
  );
}
