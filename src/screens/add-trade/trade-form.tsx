import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, SegmentedButtons } from 'react-native-paper';

import { TradeFormData } from '../../types';

type TradeFormProps = {
  formData: TradeFormData;
  onUpdate: (updates: Partial<TradeFormData>) => void;
};

export function TradeForm({ formData, onUpdate }: TradeFormProps) {
  return (
    <>
      <TextInput
        label="Symbol"
        value={formData.symbol}
        onChangeText={(text) => onUpdate({ symbol: text })}
        mode="outlined"
        style={styles.input}
        autoCapitalize="characters"
      />

      <SegmentedButtons
        value={formData.side}
        onValueChange={(value) => onUpdate({ side: value as 'long' | 'short' })}
        buttons={[
          { value: 'long', label: 'Long' },
          { value: 'short', label: 'Short' },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.row}>
        <TextInput
          label="Entry Price"
          value={formData.entryPrice}
          onChangeText={(text) => onUpdate({ entryPrice: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          style={[styles.input, styles.halfInput]}
        />
        <TextInput
          label="Exit Price"
          value={formData.exitPrice}
          onChangeText={(text) => onUpdate({ exitPrice: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          style={[styles.input, styles.halfInput]}
        />
      </View>

      <TextInput
        label="Quantity"
        value={formData.quantity}
        onChangeText={(text) => onUpdate({ quantity: text })}
        mode="outlined"
        keyboardType="number-pad"
        style={styles.input}
      />

      <TextInput
        label="Strategy (Optional)"
        value={formData.strategy}
        onChangeText={(text) => onUpdate({ strategy: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(text) => onUpdate({ notes: text })}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
});
