import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

type HomeHeaderProps = {
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
};

export function HomeHeader({ themeMode, onToggleTheme }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Trading Journal
      </Text>
      <IconButton
        icon={
          themeMode === 'dark' ? 'white-balance-sunny' : 'moon-waning-crescent'
        }
        onPress={onToggleTheme}
        size={24}
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
  },
});
