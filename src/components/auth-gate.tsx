import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useAuth } from '../hooks/use-auth';
import ForgotPasswordScreen from '../screens/auth/forgot-password-screen';
import LoginScreen from '../screens/auth/login-screen';
import RegisterScreen from '../screens/auth/register-screen';
import ResetPasswordScreen from '../screens/auth/reset-password-screen';

type AuthView = 'login' | 'register' | 'forgotPassword' | 'resetPassword';

type AuthGateProps = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [resetEmail, setResetEmail] = useState('');
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

  if (!isAuthenticated) {
    switch (view) {
      case 'register':
        return <RegisterScreen onSwitchToLogin={() => setView('login')} />;
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            initialEmail={resetEmail}
            onBackToLogin={() => setView('login')}
            onCodeSent={(email) => {
              setResetEmail(email);
              setView('resetPassword');
            }}
          />
        );
      case 'resetPassword':
        return (
          <ResetPasswordScreen
            email={resetEmail}
            onBackToLogin={() => setView('login')}
          />
        );
      default:
        return (
          <LoginScreen
            onSwitchToRegister={() => setView('register')}
            onForgotPassword={(email) => {
              setResetEmail(email);
              setView('forgotPassword');
            }}
          />
        );
    }
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
