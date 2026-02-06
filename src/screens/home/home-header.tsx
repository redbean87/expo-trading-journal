import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { useProfileStore } from '../../store/profile-store';

export function HomeHeader() {
  const { displayName } = useProfileStore();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {displayName || 'Trading Journal'}
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
