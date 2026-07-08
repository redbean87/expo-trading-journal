import { useLocalSearchParams, useRouter } from 'expo-router';

import ResetPasswordScreen from '@/screens/auth/reset-password-screen';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();

  return (
    <ResetPasswordScreen
      email={params.email}
      onBackToLogin={() => router.push('/(auth)/login')}
    />
  );
}
