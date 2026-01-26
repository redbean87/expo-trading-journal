import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

import { useAuth } from '../hooks/use-auth';
import LoginScreen from '../screens/auth/login-screen';
import RegisterScreen from '../screens/auth/register-screen';

type AuthGateProps = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const theme = useTheme();

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

  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
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
