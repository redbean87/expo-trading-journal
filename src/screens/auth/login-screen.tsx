import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  useTheme,
} from 'react-native-paper';

import { useAuth } from '../../hooks/use-auth';

type LoginScreenProps = {
  onSwitchToRegister: () => void;
};

export default function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const theme = useTheme();

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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Sign In
      </Button>

      <Button
        mode="text"
        onPress={onSwitchToRegister}
        disabled={loading}
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
