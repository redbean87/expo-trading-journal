import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import {
  TextInput,
  Text,
  HelperText,
  Card,
  useTheme,
} from 'react-native-paper';

import { Button } from '../../components/button';
import { ResponsiveContainer } from '../../components/responsive-container';
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

const styles = StyleSheet.create({
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
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  switchButton: {
    marginTop: 8,
  },
});
