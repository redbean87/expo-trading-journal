import { useRouter } from 'expo-router';

import LoginScreen from '@/screens/auth/login-screen';

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      onSwitchToRegister={() => router.push('/(auth)/register')}
      onForgotPassword={(email) =>
        router.push(
          `/(auth)/forgot-password?email=${encodeURIComponent(email)}`
        )
      }
    />
  );
}
