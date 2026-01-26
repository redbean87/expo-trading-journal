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

type RegisterScreenProps = {
  onSwitchToLogin: () => void;
};

export default function RegisterScreen({
  onSwitchToLogin,
}: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const theme = useTheme();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(email, password);
    } catch {
      setError('Failed to create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Create Account
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign up to start syncing your trades
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
        autoComplete="password-new"
        style={styles.input}
        disabled={loading}
      />

      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoComplete="password-new"
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
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Sign Up
      </Button>

      <Button
        mode="text"
        onPress={onSwitchToLogin}
        disabled={loading}
        style={styles.switchButton}
      >
        Already have an account? Sign In
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
