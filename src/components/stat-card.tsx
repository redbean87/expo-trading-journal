import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

type StatCardProps = {
  title: string;
  value: string | number;
  valueColor?: string;
};

export function StatCard({ title, value, valueColor }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge">{title}</Text>
        <Text
          variant="headlineMedium"
          style={[styles.value, valueColor && { color: valueColor }]}
        >
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 12,
  },
  value: {
    marginTop: 8,
    fontWeight: 'bold',
  },
});
