import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

import { useProfileStore } from '../../store/profile-store';

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type HomeHeaderProps = {
  onCalculatorPress?: () => void;
};

export function HomeHeader({ onCalculatorPress }: HomeHeaderProps) {
  const { displayName } = useProfileStore();
  const greeting = getGreeting(new Date().getHours());
  const name = displayName || 'Trader';

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {greeting}, {name}
      </Text>
      <IconButton
        icon="calculator"
        size={24}
        onPress={onCalculatorPress}
        style={styles.iconButton}
      />
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
    flex: 1,
  },
  iconButton: {
    margin: 0,
  },
});
