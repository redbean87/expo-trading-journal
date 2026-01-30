import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, SegmentedButtons, Text, Chip } from 'react-native-paper';

import { MistakeCategorySelector } from './mistake-category-selector';
import { DateTimeInput } from '../../components/date-time-input';
import { useFormNavigation } from '../../hooks/use-form-navigation';
import { TradeFormData } from '../../types';

const FORM_FIELDS = [
  'symbol',
  'entryPrice',
  'exitPrice',
  'quantity',
  'strategy',
  'psychology',
  'ruleViolation',
  'whatWorked',
  'whatFailed',
  'notes',
] as const;

type FormField = (typeof FORM_FIELDS)[number];

type TradeFormProps = {
  formData: TradeFormData;
  onUpdate: (updates: Partial<TradeFormData>) => void;
};

export function TradeForm({ formData, onUpdate }: TradeFormProps) {
  const { createRef, getReturnKeyType, getBlurOnSubmit, handleSubmitEditing } =
    useFormNavigation<FormField>({ fields: FORM_FIELDS });

  // Helper to get web-specific props for multiline fields
  const getMultilineWebProps = (field: FormField) => {
    if (Platform.OS !== 'web') return {};
    return { 'data-form-field': field } as Record<string, string>;
  };

  return (
    <>
      <TextInput
        ref={createRef('symbol')}
        label="Symbol"
        value={formData.symbol}
        onChangeText={(text) => onUpdate({ symbol: text })}
        mode="outlined"
        style={styles.input}
        autoCapitalize="characters"
        returnKeyType={getReturnKeyType('symbol')}
        blurOnSubmit={getBlurOnSubmit('symbol')}
        onSubmitEditing={() => handleSubmitEditing('symbol')}
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
          ref={createRef('entryPrice')}
          label="Entry Price"
          value={formData.entryPrice}
          onChangeText={(text) => onUpdate({ entryPrice: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          style={[styles.input, styles.halfInput]}
          returnKeyType={getReturnKeyType('entryPrice')}
          blurOnSubmit={getBlurOnSubmit('entryPrice')}
          onSubmitEditing={() => handleSubmitEditing('entryPrice')}
        />
        <TextInput
          ref={createRef('exitPrice')}
          label="Exit Price"
          value={formData.exitPrice}
          onChangeText={(text) => onUpdate({ exitPrice: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          style={[styles.input, styles.halfInput]}
          returnKeyType={getReturnKeyType('exitPrice')}
          blurOnSubmit={getBlurOnSubmit('exitPrice')}
          onSubmitEditing={() => handleSubmitEditing('exitPrice')}
        />
      </View>

      <TextInput
        ref={createRef('quantity')}
        label="Quantity"
        value={formData.quantity}
        onChangeText={(text) => onUpdate({ quantity: text })}
        mode="outlined"
        keyboardType="number-pad"
        style={styles.input}
        returnKeyType={getReturnKeyType('quantity')}
        blurOnSubmit={getBlurOnSubmit('quantity')}
        onSubmitEditing={() => handleSubmitEditing('quantity')}
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
        ref={createRef('strategy')}
        label="Strategy (Optional)"
        value={formData.strategy}
        onChangeText={(text) => onUpdate({ strategy: text })}
        mode="outlined"
        style={styles.input}
        returnKeyType={getReturnKeyType('strategy')}
        blurOnSubmit={getBlurOnSubmit('strategy')}
        onSubmitEditing={() => handleSubmitEditing('strategy')}
      />

      <TextInput
        ref={createRef('psychology')}
        label="Psychology (Optional)"
        value={formData.psychology}
        onChangeText={(text) => onUpdate({ psychology: text })}
        mode="outlined"
        placeholder="anxious, calm, fomo, rushed, excited, impatient"
        style={styles.input}
        returnKeyType={getReturnKeyType('psychology')}
        blurOnSubmit={getBlurOnSubmit('psychology')}
        onSubmitEditing={() => handleSubmitEditing('psychology')}
      />

      <View style={styles.confidenceContainer}>
        <Text variant="bodyMedium" style={styles.confidenceLabel}>
          Confidence (Optional)
        </Text>
        <View style={styles.confidenceChips}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Chip
              key={value}
              selected={formData.confidence === value}
              onPress={() =>
                onUpdate({
                  confidence: formData.confidence === value ? undefined : value,
                })
              }
              style={[
                styles.confidenceChip,
                formData.confidence === value && styles.confidenceChipSelected,
              ]}
              textStyle={styles.confidenceChipText}
              showSelectedOverlay
              showSelectedCheck={false}
              compact
            >
              {value}
            </Chip>
          ))}
        </View>
      </View>

      <MistakeCategorySelector
        value={formData.ruleViolation}
        onSelect={(text) => onUpdate({ ruleViolation: text || undefined })}
      />
      <TextInput
        ref={createRef('ruleViolation')}
        label="Rule Violation (Optional)"
        value={formData.ruleViolation}
        onChangeText={(text) => onUpdate({ ruleViolation: text || undefined })}
        mode="outlined"
        placeholder="Select above or describe what went wrong"
        style={styles.input}
        returnKeyType={getReturnKeyType('ruleViolation')}
        blurOnSubmit={getBlurOnSubmit('ruleViolation')}
        onSubmitEditing={() => handleSubmitEditing('ruleViolation')}
      />

      <TextInput
        ref={createRef('whatWorked')}
        label="What Worked (Optional)"
        value={formData.whatWorked}
        onChangeText={(text) => onUpdate({ whatWorked: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        returnKeyType={getReturnKeyType('whatWorked')}
        blurOnSubmit={getBlurOnSubmit('whatWorked')}
        onSubmitEditing={() => handleSubmitEditing('whatWorked')}
        {...getMultilineWebProps('whatWorked')}
      />

      <TextInput
        ref={createRef('whatFailed')}
        label="What Didn't Work (Optional)"
        value={formData.whatFailed}
        onChangeText={(text) => onUpdate({ whatFailed: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        returnKeyType={getReturnKeyType('whatFailed')}
        blurOnSubmit={getBlurOnSubmit('whatFailed')}
        onSubmitEditing={() => handleSubmitEditing('whatFailed')}
        {...getMultilineWebProps('whatFailed')}
      />

      <TextInput
        ref={createRef('notes')}
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(text) => onUpdate({ notes: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        returnKeyType={getReturnKeyType('notes')}
        blurOnSubmit={getBlurOnSubmit('notes')}
        onSubmitEditing={() => handleSubmitEditing('notes')}
        {...getMultilineWebProps('notes')}
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
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  confidenceChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidenceChip: {
    flex: 1,
    marginHorizontal: 2,
  },
  confidenceChipText: {
    textAlign: 'center',
    flexGrow: 1,
  },
  confidenceChipSelected: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
