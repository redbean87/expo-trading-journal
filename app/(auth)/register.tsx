import { useRouter } from 'expo-router';

import RegisterScreen from '@/screens/auth/register-screen';

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen onSwitchToLogin={() => router.push('/(auth)/login')} />
  );
}
