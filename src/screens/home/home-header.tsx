import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { useProfileStore } from '../../store/profile-store';

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeHeader() {
  const { displayName } = useProfileStore();
  const greeting = getGreeting(new Date().getHours());
  const name = displayName || 'Trader';

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {greeting}, {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
});
