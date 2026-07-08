import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Text, HelperText, Card } from 'react-native-paper';

import { Button } from '../../components/button';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useAuth } from '../../hooks/use-auth';

type ForgotPasswordScreenProps = {
  initialEmail?: string;
  onBackToLogin: () => void;
  onCodeSent: (email: string) => void;
};

export default function ForgotPasswordScreen({
  initialEmail,
  onBackToLogin,
  onCodeSent,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { requestPasswordReset } = useAuth();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handleSendReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      if (error instanceof Error && error.message === 'network') {
        setError('No internet connection. Please check your network.');
      } else {
        // Don't reveal whether the email exists
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.successTitle}>
                Check Your Email
              </Text>
              <Text variant="bodyMedium" style={styles.successText}>
                If an account exists with that email, we&apos;ve sent a password
                reset code. It expires in 1 hour.
              </Text>

              {error ? (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={() => onCodeSent(email)}
                style={styles.button}
              >
                Enter Code
              </Button>

              <Button
                mode="text"
                onPress={onBackToLogin}
                style={styles.switchButton}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Reset Password
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter your email and we&apos;ll send you a reset code
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

            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSendReset}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Send Reset Code
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
    successTitle: {
      textAlign: 'center',
      marginBottom: 12,
    },
    successText: {
      textAlign: 'center',
      marginBottom: 24,
      opacity: 0.7,
    },
  });
