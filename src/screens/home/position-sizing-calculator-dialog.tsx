import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Dialog, Portal, Text, TextInput } from 'react-native-paper';

import { Button } from '../../components/button';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useProfileStore } from '../../store/profile-store';

type PositionSizingCalculatorDialogProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function PositionSizingCalculatorDialog({
  visible,
  onDismiss,
}: PositionSizingCalculatorDialogProps) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);
  const { defaultRiskPercent } = useProfileStore();

  const isNarrow = width < 480;

  const [accountSizeStr, setAccountSizeStr] = useState('');
  const [riskPctStr, setRiskPctStr] = useState(
    defaultRiskPercent != null ? String(defaultRiskPercent) : ''
  );
  const [entryPriceStr, setEntryPriceStr] = useState('');
  const [stopPriceStr, setStopPriceStr] = useState('');

  const results = useMemo(() => {
    const accountSize = parseFloat(accountSizeStr);
    const riskPct = parseFloat(riskPctStr);
    const entryPrice = parseFloat(entryPriceStr);
    const stopPrice = parseFloat(stopPriceStr);

    if (
      isNaN(accountSize) ||
      accountSize <= 0 ||
      isNaN(riskPct) ||
      riskPct <= 0 ||
      isNaN(entryPrice) ||
      entryPrice <= 0 ||
      isNaN(stopPrice) ||
      stopPrice <= 0 ||
      entryPrice === stopPrice
    ) {
      return null;
    }

    const dollarRisk = accountSize * (riskPct / 100);
    const riskPerShare = Math.abs(entryPrice - stopPrice);
    const positionSize = Math.floor(dollarRisk / riskPerShare);
    const positionValue = positionSize * entryPrice;

    return { dollarRisk, riskPerShare, positionSize, positionValue };
  }, [accountSizeStr, riskPctStr, entryPriceStr, stopPriceStr]);

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (!visible) return null;

  return (
    <Portal>
      <Dialog visible={true} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Position Size Calculator</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            <View style={styles.scrollContent}>
              <View style={[styles.row, isNarrow && styles.rowColumn]}>
                <TextInput
                  label="Account Size ($)"
                  value={accountSizeStr}
                  onChangeText={setAccountSizeStr}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={[styles.input, !isNarrow && styles.halfInput]}
                />
                <TextInput
                  label="Risk %"
                  value={riskPctStr}
                  onChangeText={setRiskPctStr}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={[styles.input, !isNarrow && styles.halfInput]}
                />
              </View>

              <View style={[styles.row, isNarrow && styles.rowColumn]}>
                <TextInput
                  label="Entry Price"
                  value={entryPriceStr}
                  onChangeText={setEntryPriceStr}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={[styles.input, !isNarrow && styles.halfInput]}
                />
                <TextInput
                  label="Stop Price"
                  value={stopPriceStr}
                  onChangeText={setStopPriceStr}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={[styles.input, !isNarrow && styles.halfInput]}
                />
              </View>

              {results ? (
                <View style={styles.results}>
                  <ResultRow
                    label="Dollar Risk"
                    value={`$${formatCurrency(results.dollarRisk)}`}
                    theme={theme}
                  />
                  <ResultRow
                    label="Risk Per Share"
                    value={`$${formatCurrency(results.riskPerShare)}`}
                    theme={theme}
                  />
                  <ResultRow
                    label="Position Size"
                    value={`${results.positionSize.toLocaleString()} shares`}
                    highlight
                    theme={theme}
                  />
                  <ResultRow
                    label="Position Value"
                    value={`$${formatCurrency(results.positionValue)}`}
                    theme={theme}
                  />
                  <Text variant="bodySmall" style={styles.hint}>
                    Use ${formatCurrency(results.dollarRisk)} as the risk amount
                    when logging this trade
                  </Text>
                </View>
              ) : (
                <View style={styles.placeholder}>
                  <Text variant="bodySmall" style={styles.placeholderText}>
                    Fill in all fields to calculate position size
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function ResultRow({
  label,
  value,
  highlight,
  theme,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={resultRowStyles(theme, highlight).row}>
      <Text
        variant={highlight ? 'bodyMedium' : 'bodySmall'}
        style={resultRowStyles(theme, highlight).label}
      >
        {label}
      </Text>
      <Text
        variant={highlight ? 'titleMedium' : 'bodyMedium'}
        style={resultRowStyles(theme, highlight).value}
      >
        {value}
      </Text>
    </View>
  );
}

const resultRowStyles = (
  theme: ReturnType<typeof useAppTheme>,
  highlight?: boolean
) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: highlight ? 6 : 4,
      borderBottomWidth: highlight ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outline,
    },
    label: {
      color: theme.colors.textSecondary,
    },
    value: {
      color: theme.colors.onSurface,
      fontWeight: highlight ? 'bold' : 'normal',
    },
  });

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    dialog: {
      maxWidth: 480,
      alignSelf: 'center',
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    rowColumn: {
      flexDirection: 'column',
    },
    input: {
      marginBottom: theme.spacing.md,
    },
    halfInput: {
      flex: 1,
    },
    results: {
      marginTop: theme.spacing.sm,
      gap: 0,
    },
    hint: {
      marginTop: theme.spacing.md,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    placeholder: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    placeholderText: {
      color: theme.colors.textSecondary,
    },
    scrollArea: {
      maxHeight: 400,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: theme.spacing.sm,
    },
  });
