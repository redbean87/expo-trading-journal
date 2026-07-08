import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Text, HelperText, Card } from 'react-native-paper';

import { AuthDivider } from '../../components/auth-divider';
import { Button } from '../../components/button';
import { GoogleSignInButton } from '../../components/google-sign-in-button';
import { ResponsiveContainer } from '../../components/responsive-container';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useAuth } from '../../hooks/use-auth';

type LoginScreenProps = {
  onSwitchToRegister: () => void;
  onForgotPassword: (email: string) => void;
};

export default function LoginScreen({
  onSwitchToRegister,
  onForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signInWithGoogle } = useAuth();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      if (error instanceof Error && error.message === 'network') {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ResponsiveContainer>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Trading Journal
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                style={styles.input}
                disabled={loading}
              />

              {error ? (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="text"
                onPress={() => onForgotPassword(email)}
                disabled={loading}
                compact
                style={styles.forgotButton}
              >
                Forgot Password?
              </Button>

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Sign In
              </Button>
            </Card.Content>
          </Card>

          <AuthDivider />

          <GoogleSignInButton
            onPress={signInWithGoogle}
            loading={loading}
            disabled={loading}
          />

          <Button
            mode="text"
            onPress={onSwitchToRegister}
            disabled={loading}
            style={styles.switchButton}
          >
            Don&apos;t have an account? Sign Up
          </Button>
        </View>
      </ResponsiveContainer>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      textAlign: 'center',
      marginBottom: 24,
    },
    card: {
      maxWidth: 600,
      width: '100%',
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      ...theme.elevation[2],
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    button: {
      marginTop: 8,
    },
    forgotButton: {
      alignSelf: 'flex-start',
      marginBottom: 4,
      marginTop: -4,
    },
    switchButton: {
      marginTop: 8,
    },
  });
