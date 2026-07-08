import { Redirect } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import DuplicateReviewScreen from '@/screens/duplicate-review-screen';

export default function DuplicateReviewRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <DuplicateReviewScreen />;
}
