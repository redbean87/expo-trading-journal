import { useLocalSearchParams, useRouter } from 'expo-router';

import ForgotPasswordScreen from '@/screens/auth/forgot-password-screen';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  return (
    <ForgotPasswordScreen
      initialEmail={params.email}
      onBackToLogin={() => router.push('/(auth)/login')}
      onCodeSent={(email) =>
        router.push(`/(auth)/reset-password?email=${encodeURIComponent(email)}`)
      }
    />
  );
}
