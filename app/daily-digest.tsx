import { Stack } from 'expo-router';

import DailyDigestScreen from '@/screens/daily-digest-screen';

export default function DailyDigestModal() {
  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <DailyDigestScreen />
    </>
  );
}
