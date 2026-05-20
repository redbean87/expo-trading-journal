import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Dialog, Divider, Portal, Text } from 'react-native-paper';

import { Button } from '../../components/button';
import { Chip } from '../../components/chip';
import { useAppTheme } from '../../hooks/use-app-theme';
import { TradeFilters, PnlFilter } from '../../hooks/use-trade-filters';
import { TradeSide } from '../../types';

type TradeFilterModalContentProps = {
  onDismiss: () => void;
  filters: TradeFilters;
  uniqueStrategies: string[];
  onApplyFilters: (filters: TradeFilters) => void;
  onClearFilters: () => void;
};

type TradeFilterModalProps = TradeFilterModalContentProps & {
  visible: boolean;
};

type SideOption = { label: string; value: TradeSide | 'all' };
type PnlOption = { label: string; value: PnlFilter };

const sideOptions: SideOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Long', value: 'long' },
  { label: 'Short', value: 'short' },
];

const pnlOptions: PnlOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Winning', value: 'winning' },
  { label: 'Losing', value: 'losing' },
];

function TradeFilterModalContent({
  onDismiss,
  filters,
  uniqueStrategies,
  onApplyFilters,
  onClearFilters,
}: TradeFilterModalContentProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [localFilters, setLocalFilters] = useState<TradeFilters>(filters);

  const updateLocalFilter = <K extends keyof TradeFilters>(
    key: K,
    value: TradeFilters[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onDismiss();
  };

  const handleClearAndClose = () => {
    onClearFilters();
    onDismiss();
  };

  return (
    <>
      <Portal>
        <Dialog visible={true} onDismiss={onDismiss} style={styles.dialog}>
          <Dialog.Title>Filter Trades</Dialog.Title>

          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              {/* Side Filter */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Side
                </Text>
                <View style={styles.chipRow}>
                  {sideOptions.map((option) => (
                    <Chip
                      key={option.value}
                      selected={localFilters.side === option.value}
                      onPress={() => updateLocalFilter('side', option.value)}
                      style={styles.chip}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <Divider />

              {/* P&L Filter */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Result
                </Text>
                <View style={styles.chipRow}>
                  {pnlOptions.map((option) => (
                    <Chip
                      key={option.value}
                      selected={localFilters.pnl === option.value}
                      onPress={() => updateLocalFilter('pnl', option.value)}
                      style={styles.chip}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <Divider />

              {/* Strategy Filter */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Strategy
                </Text>
                <View style={styles.chipRow}>
                  <Chip
                    selected={localFilters.strategy === 'all'}
                    onPress={() => updateLocalFilter('strategy', 'all')}
                    style={styles.chip}
                  >
                    All
                  </Chip>
                  {uniqueStrategies.map((strategy) => (
                    <Chip
                      key={strategy}
                      selected={localFilters.strategy === strategy}
                      onPress={() => updateLocalFilter('strategy', strategy)}
                      style={styles.chip}
                    >
                      {strategy}
                    </Chip>
                  ))}
                </View>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button onPress={handleClearAndClose}>Clear All</Button>
            <Button onPress={handleApply}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

export function TradeFilterModal({ visible, ...props }: TradeFilterModalProps) {
  if (!visible) return null;
  return <TradeFilterModalContent {...props} />;
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    dialog: {
      maxWidth: 600,
      alignSelf: 'center',
      width: '90%',
    },
    scrollArea: {
      maxHeight: 400,
    },
    section: {
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    sectionTitle: {
      marginBottom: 12,
      color: theme.colors.textSecondary,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      marginBottom: 4,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
    },
    dateButton: {
      flex: 1,
    },
  });
