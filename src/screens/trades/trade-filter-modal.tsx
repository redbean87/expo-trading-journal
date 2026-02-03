import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Modal, Portal, Text } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

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
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

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

  const formatDate = (date: Date | null) => {
    if (!date) return 'Any';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClearAndClose = () => {
    onClearFilters();
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text variant="titleLarge" style={styles.title}>
          Filter Trades
        </Text>

        <ScrollView style={styles.scrollView}>
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

          <Divider style={styles.divider} />

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

          <Divider style={styles.divider} />

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

          <Divider style={styles.divider} />

          {/* Date Range Filter */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Date Range
            </Text>
            <View style={styles.dateRow}>
              <Button
                mode="outlined"
                onPress={() => setShowDateFromPicker(true)}
                style={styles.dateButton}
                compact
              >
                From: {formatDate(localFilters.dateFrom)}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowDateToPicker(true)}
                style={styles.dateButton}
                compact
              >
                To: {formatDate(localFilters.dateTo)}
              </Button>
            </View>
            {(localFilters.dateFrom || localFilters.dateTo) && (
              <Button
                mode="text"
                onPress={() => {
                  updateLocalFilter('dateFrom', null);
                  updateLocalFilter('dateTo', null);
                }}
                compact
              >
                Clear dates
              </Button>
            )}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button mode="outlined" onPress={handleClearAndClose}>
            Clear All
          </Button>
          <Button mode="contained" onPress={handleApply}>
            Apply
          </Button>
        </View>
      </Modal>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={showDateFromPicker}
        onDismiss={() => setShowDateFromPicker(false)}
        date={localFilters.dateFrom || undefined}
        onConfirm={({ date }) => {
          setShowDateFromPicker(false);
          updateLocalFilter('dateFrom', date || null);
        }}
      />

      <DatePickerModal
        locale="en"
        mode="single"
        visible={showDateToPicker}
        onDismiss={() => setShowDateToPicker(false)}
        date={localFilters.dateTo || undefined}
        onConfirm={({ date }) => {
          setShowDateToPicker(false);
          updateLocalFilter('dateTo', date || null);
        }}
      />
    </Portal>
  );
}

export function TradeFilterModal({ visible, ...props }: TradeFilterModalProps) {
  if (!visible) return null;
  return <TradeFilterModalContent {...props} />;
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    modal: {
      backgroundColor: theme.colors.surface,
      margin: 20,
      borderRadius: 12,
      maxHeight: '80%',
    },
    title: {
      padding: 20,
      paddingBottom: 12,
    },
    scrollView: {
      maxHeight: 400,
    },
    section: {
      paddingHorizontal: 20,
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
    divider: {
      marginHorizontal: 20,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
    },
    dateButton: {
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      padding: 20,
      paddingTop: 12,
    },
  });
