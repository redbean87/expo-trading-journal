import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useAuth } from '../hooks/use-auth';

type AuthGateProps = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const { isLoading } = useAuth();
  const theme = useAppTheme();

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
