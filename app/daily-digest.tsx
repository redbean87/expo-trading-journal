import { Redirect } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import DailyDigestScreen from '@/screens/daily-digest-screen';

export default function DailyDigestRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <DailyDigestScreen />;
}
