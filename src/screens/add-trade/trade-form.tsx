import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';

import { MistakeCategorySelector } from './mistake-category-selector';
import { PsychologySelector } from './psychology-selector';
import { StrategySelector } from './strategy-selector';
import { Chip } from '../../components/chip';
import { DateTimeInput } from '../../components/date-time-input';
import { FormLayout } from '../../components/form-layout';
import { SegmentedButtons } from '../../components/segmented-buttons';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useFormNavigation } from '../../hooks/use-form-navigation';
import { useProfileStore } from '../../store/profile-store';
import { TradeFormData } from '../../types';

const FORM_FIELDS = [
  'symbol',
  'entryPrice',
  'exitPrice',
  'quantity',
  'fees',
  'commissions',
  'riskAmount',
  'strategy',
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

type RiskMode = '$' | '%';

export function TradeForm({ formData, onUpdate }: TradeFormProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { createRef, getReturnKeyType, getBlurOnSubmit, handleSubmitEditing } =
    useFormNavigation<FormField>({ fields: FORM_FIELDS });

  const { defaultRiskPercent, setDefaultRiskPercent } = useProfileStore();
  const [riskMode, setRiskMode] = useState<RiskMode>('$');
  const [riskPctStr, setRiskPctStr] = useState(
    defaultRiskPercent != null ? String(defaultRiskPercent) : ''
  );

  const handleRiskModeChange = (mode: RiskMode) => {
    setRiskMode(mode);

    if (mode === '%') {
      const entryPrice = parseFloat(formData.entryPrice);
      const quantity = parseFloat(formData.quantity);
      const riskAmount =
        formData.riskAmount && formData.riskAmount !== ''
          ? parseFloat(formData.riskAmount)
          : NaN;
      if (
        !isNaN(riskAmount) &&
        riskAmount > 0 &&
        !isNaN(entryPrice) &&
        entryPrice > 0 &&
        !isNaN(quantity) &&
        quantity > 0
      ) {
        const pct = (riskAmount / (entryPrice * quantity)) * 100;
        setRiskPctStr(pct.toFixed(2));
      } else {
        setRiskPctStr(
          defaultRiskPercent != null ? String(defaultRiskPercent) : ''
        );
      }
    }
  };

  const handleRiskPctChange = (text: string) => {
    setRiskPctStr(text);
    const pct = parseFloat(text);
    if (!isNaN(pct) && pct > 0) {
      setDefaultRiskPercent(pct);
    }
    const entryPrice = parseFloat(formData.entryPrice);
    const quantity = parseFloat(formData.quantity);
    if (!isNaN(pct) && pct > 0 && !isNaN(entryPrice) && !isNaN(quantity)) {
      const computed = (entryPrice * quantity * pct) / 100;
      onUpdate({ riskAmount: computed.toFixed(2) });
    } else {
      onUpdate({ riskAmount: '' });
    }
  };

  // Helper to get web-specific props for multiline fields
  const getMultilineWebProps = (field: FormField) => {
    if (Platform.OS !== 'web') return {};
    return { 'data-form-field': field } as Record<string, string>;
  };

  return (
    <>
      <FormLayout title="Trade Details">
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
          onValueChange={(value) =>
            onUpdate({ side: value as 'long' | 'short' })
          }
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
      </FormLayout>

      <FormLayout title="Timing">
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
      </FormLayout>

      <FormLayout title="Fees">
        <View style={styles.row}>
          <TextInput
            ref={createRef('fees')}
            label="Fees (Optional)"
            value={formData.fees}
            onChangeText={(text) => onUpdate({ fees: text })}
            mode="outlined"
            keyboardType="decimal-pad"
            style={[styles.input, styles.halfInput]}
            returnKeyType={getReturnKeyType('fees')}
            blurOnSubmit={getBlurOnSubmit('fees')}
            onSubmitEditing={() => handleSubmitEditing('fees')}
          />
          <TextInput
            ref={createRef('commissions')}
            label="Commissions (Optional)"
            value={formData.commissions}
            onChangeText={(text) => onUpdate({ commissions: text })}
            mode="outlined"
            keyboardType="decimal-pad"
            style={[styles.input, styles.halfInput]}
            returnKeyType={getReturnKeyType('commissions')}
            blurOnSubmit={getBlurOnSubmit('commissions')}
            onSubmitEditing={() => handleSubmitEditing('commissions')}
          />
        </View>
      </FormLayout>

      <FormLayout title="Risk">
        <SegmentedButtons
          value={riskMode}
          onValueChange={(value) => handleRiskModeChange(value as RiskMode)}
          buttons={[
            { value: '$', label: 'Flat $' },
            { value: '%', label: '% of Position' },
          ]}
          style={styles.segmentedButtons}
        />

        {riskMode === '$' ? (
          <TextInput
            ref={createRef('riskAmount')}
            label="Risk $ (Optional)"
            value={formData.riskAmount}
            onChangeText={(text) => onUpdate({ riskAmount: text })}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
            returnKeyType={getReturnKeyType('riskAmount')}
            blurOnSubmit={getBlurOnSubmit('riskAmount')}
            onSubmitEditing={() => handleSubmitEditing('riskAmount')}
          />
        ) : (
          <TextInput
            label="Risk % (Optional)"
            value={riskPctStr}
            onChangeText={handleRiskPctChange}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        )}

        {formData.riskAmount ? (
          <HelperText type="info" style={styles.riskHelper}>
            Risk amount: ${parseFloat(formData.riskAmount).toFixed(2)} (
            {(
              (parseFloat(formData.riskAmount) /
                (parseFloat(formData.entryPrice) *
                  parseFloat(formData.quantity))) *
              100
            ).toFixed(2)}
            % of position value)
          </HelperText>
        ) : null}

        <HelperText type="info" style={styles.riskHelper}>
          Optional — enables R-multiple analytics
        </HelperText>
      </FormLayout>

      <FormLayout title="Psychology & Notes" last>
        <StrategySelector
          value={formData.strategy}
          onSelect={(text) => onUpdate({ strategy: text || undefined })}
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

        <PsychologySelector
          value={formData.psychology}
          onChange={(text) => onUpdate({ psychology: text || undefined })}
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
                    confidence:
                      formData.confidence === value ? undefined : value,
                  })
                }
                style={styles.confidenceChip}
                textStyle={styles.confidenceChipText}
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
          onChangeText={(text) =>
            onUpdate({ ruleViolation: text || undefined })
          }
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
      </FormLayout>
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    input: {
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    halfInput: {
      flex: 1,
    },
    segmentedButtons: {
      marginBottom: theme.spacing.lg,
    },
    riskHelper: {
      marginTop: -theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    confidenceContainer: {
      marginBottom: theme.spacing.lg,
    },
    confidenceLabel: {
      marginBottom: theme.spacing.sm,
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
  });
