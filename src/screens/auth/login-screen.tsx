import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';

import { AuthDivider } from '../../components/auth-divider';
import { GoogleSignInButton } from '../../components/google-sign-in-button';
import { useAuth } from '../../hooks/use-auth';

type LoginScreenProps = {
  onSwitchToRegister: () => void;
};

export default function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
    } catch {
      setError('Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = loading || googleLoading;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Trading Journal
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign in to sync your trades
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        style={styles.input}
        disabled={isLoading}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        style={styles.input}
        disabled={isLoading}
      />

      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={isLoading}
        style={styles.button}
      >
        Sign In
      </Button>

      <AuthDivider />

      <GoogleSignInButton
        onPress={handleGoogleSignIn}
        loading={googleLoading}
        disabled={isLoading}
        mode="signIn"
      />

      <Button
        mode="text"
        onPress={onSwitchToRegister}
        disabled={isLoading}
        style={styles.switchButton}
      >
        Don&apos;t have an account? Sign Up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  switchButton: {
    marginTop: 16,
  },
});
