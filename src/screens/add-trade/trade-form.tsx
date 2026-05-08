import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';

import { HtfContextSelector } from './htf-context-selector';
import { MarketConditionSelector } from './market-condition-selector';
import { MistakeCategorySelector } from './mistake-category-selector';
import { PnlPreviewCard } from './pnl-preview-card';
import { PsychologySelector } from './psychology-selector';
import { StrategySelector } from './strategy-selector';
import { WhatFailedSelector } from './what-failed-selector';
import { WhatWorkedSelector } from './what-worked-selector';
import { Button } from '../../components/button';
import { Chip } from '../../components/chip';
import { DateTimeInput } from '../../components/date-time-input';
import { SectionCard } from '../../components/section-card';
import { ToggleButtons } from '../../components/toggle-buttons';
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
  'notes',
] as const;

type FormField = (typeof FORM_FIELDS)[number];

type TradeFormProps = {
  formData: TradeFormData;
  pnl: number;
  pnlPercent: number;
  onUpdate: (updates: Partial<TradeFormData>) => void;
};

type RiskMode = '$' | '%';

export function TradeForm({
  formData,
  pnl,
  pnlPercent,
  onUpdate,
}: TradeFormProps) {
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
      <SectionCard title="Trade Basics">
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

        <ToggleButtons
          value={formData.side}
          onValueChange={(value) =>
            onUpdate({ side: value as 'long' | 'short' })
          }
          buttons={[
            { value: 'long', label: 'Long' },
            { value: 'short', label: 'Short' },
          ]}
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

        <View style={styles.row}>
          {riskMode === '$' ? (
            <TextInput
              ref={createRef('riskAmount')}
              label="Risk $ (Optional)"
              value={formData.riskAmount}
              onChangeText={(text) => onUpdate({ riskAmount: text })}
              mode="outlined"
              keyboardType="decimal-pad"
              style={[styles.input, styles.flexInput]}
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
              style={[styles.input, styles.flexInput]}
            />
          )}

          <View style={styles.miniToggle}>
            <Button
              mode={riskMode === '$' ? 'contained' : 'outlined'}
              onPress={() => handleRiskModeChange('$')}
              style={[
                styles.miniToggleButton,
                riskMode === '$' && styles.miniToggleButtonActive,
              ]}
              labelStyle={[
                styles.miniToggleText,
                riskMode === '$' && styles.miniToggleTextActive,
              ]}
            >
              $
            </Button>
            <Button
              mode={riskMode === '%' ? 'contained' : 'outlined'}
              onPress={() => handleRiskModeChange('%')}
              style={[
                styles.miniToggleButton,
                riskMode === '%' && styles.miniToggleButtonActive,
              ]}
              labelStyle={[
                styles.miniToggleText,
                riskMode === '%' && styles.miniToggleTextActive,
              ]}
            >
              %
            </Button>
          </View>
        </View>

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
      </SectionCard>

      {formData.entryPrice && formData.exitPrice && formData.quantity && (
        <PnlPreviewCard pnl={pnl} pnlPercent={pnlPercent} />
      )}

      <SectionCard title="Setup Context">
        <StrategySelector
          value={formData.strategy}
          onSelect={(text) => onUpdate({ strategy: text || undefined })}
        />

        <MarketConditionSelector
          value={formData.marketCondition}
          onSelect={(condition) =>
            onUpdate({ marketCondition: condition || undefined })
          }
        />

        <HtfContextSelector
          value={formData.htfContext}
          onSelect={(context) => onUpdate({ htfContext: context || undefined })}
        />

        <View style={styles.confidenceContainer}>
          <Text variant="bodySmall" style={styles.confidenceLabel}>
            Confidence (Optional)
          </Text>
          <View style={styles.confidenceChips}>
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = formData.confidence === value;
              return (
                <Chip
                  key={value}
                  selected={isSelected}
                  onPress={() =>
                    onUpdate({
                      confidence:
                        formData.confidence === value ? undefined : value,
                    })
                  }
                  style={[
                    styles.confidenceChip,
                    isSelected && styles.confidenceChipSelected,
                  ]}
                  textStyle={[
                    styles.confidenceChipText,
                    isSelected && styles.confidenceChipTextSelected,
                  ]}
                  compact
                >
                  {value}
                </Chip>
              );
            })}
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Trade Management">
        <MistakeCategorySelector
          value={formData.ruleViolation}
          onSelect={(text) => onUpdate({ ruleViolation: text || undefined })}
        />

        <WhatWorkedSelector
          value={formData.whatWorked}
          onChange={(text) => onUpdate({ whatWorked: text || undefined })}
        />

        <WhatFailedSelector
          value={formData.whatFailed}
          onChange={(text) => onUpdate({ whatFailed: text || undefined })}
        />
      </SectionCard>

      <SectionCard title="Psychology">
        <PsychologySelector
          value={formData.psychology}
          onChange={(text) => onUpdate({ psychology: text || undefined })}
        />
      </SectionCard>

      <SectionCard title="Reflection">
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
      </SectionCard>
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
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    confidenceChipSelected: {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.primaryContainer,
    },
    confidenceChipTextSelected: {
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    flexInput: {
      flex: 1,
    },
    miniToggle: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      alignItems: 'center',
    },
    miniToggleButton: {
      minWidth: 44,
      paddingHorizontal: 4,
      borderRadius: theme.spacing.sm,
    },
    miniToggleButtonActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    miniToggleText: {
      fontSize: 14,
      fontWeight: '600',
    },
    miniToggleTextActive: {
      color: theme.colors.onPrimaryContainer,
    },
  });
