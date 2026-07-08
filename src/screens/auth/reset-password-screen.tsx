import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Text, HelperText, Card } from 'react-native-paper';

import { Button } from '../../components/button';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useAuth } from '../../hooks/use-auth';

type ResetPasswordScreenProps = {
  email: string;
  onBackToLogin: () => void;
};

export default function ResetPasswordScreen({
  email,
  onBackToLogin,
}: ResetPasswordScreenProps) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handleReset = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(email, code, newPassword);
      // On success, Convex Auth auto-signs in the user, so AuthGate will
      // detect the authenticated state and show the app.
    } catch (error) {
      if (error instanceof Error && error.message === 'network') {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Invalid or expired code. Please try again.');
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
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Set New Password
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter the code from your email and choose a new password
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Reset Code"
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoComplete="one-time-code"
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="new-password"
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
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
              onPress={handleReset}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Reset Password
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="text"
          onPress={onBackToLogin}
          disabled={loading}
          style={styles.switchButton}
        >
          Back to Login
        </Button>
      </View>
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
      marginBottom: 8,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 32,
      opacity: 0.7,
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
    switchButton: {
      marginTop: 8,
    },
  });
