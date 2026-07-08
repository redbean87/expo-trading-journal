import { Redirect } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import AddTradeScreen from '@/screens/add-trade-screen';

export default function AddTradeRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AddTradeScreen />;
}
