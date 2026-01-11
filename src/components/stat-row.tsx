import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type StatRowProps = {
  label: string;
  value: string | number;
  valueColor?: string;
};

export function StatRow({ label, value, valueColor }: StatRowProps) {
  return (
    <View style={styles.row}>
      <Text variant="bodyLarge">{label}</Text>
      <Text
        variant="bodyLarge"
        style={[styles.value, valueColor && { color: valueColor }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  value: {
    fontWeight: 'bold',
  },
});
