import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, SegmentedButtons } from 'react-native-paper';

import { DateTimeInput } from '../../components/date-time-input';
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

      <DateTimeInput
        label="Entry Time"
        value={formData.entryTime}
        onChange={(date) => onUpdate({ entryTime: date })}
      />

      <DateTimeInput
        label="Exit Time"
        value={formData.exitTime}
        onChange={(date) => onUpdate({ exitTime: date })}
      />

      <TextInput
        label="Strategy (Optional)"
        value={formData.strategy}
        onChangeText={(text) => onUpdate({ strategy: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Psychology (Optional)"
        value={formData.psychology}
        onChangeText={(text) => onUpdate({ psychology: text })}
        mode="outlined"
        placeholder="anxious, calm, fomo, rushed, excited, impatient"
        style={styles.input}
      />

      <TextInput
        label="What Worked (Optional)"
        value={formData.whatWorked}
        onChangeText={(text) => onUpdate({ whatWorked: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <TextInput
        label="What Didn't Work (Optional)"
        value={formData.whatFailed}
        onChangeText={(text) => onUpdate({ whatFailed: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <TextInput
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(text) => onUpdate({ notes: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
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
