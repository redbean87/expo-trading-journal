import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Snackbar, Portal, Text } from 'react-native-paper';

import { EmptyState } from '../components/empty-state';
import { SearchBar } from '../components/search-bar';
import { TradeCard } from '../components/trade-card';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTradeFilters } from '../hooks/use-trade-filters';
import {
  useTrades,
  useDeleteTrade,
  useImportTrades,
} from '../hooks/use-trades';
import { Trade } from '../types';
import { parseCsvFile } from '../utils/csv-import';
import { TradeFilterModal } from './trades/trade-filter-modal';

export default function TradesScreen() {
  const { trades } = useTrades();
  const deleteTrade = useDeleteTrade();
  const importTrades = useImportTrades();
  const router = useRouter();
  const theme = useAppTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const {
    filters,
    filteredTrades,
    uniqueStrategies,
    activeFilterCount,
    updateFilter,
    clearFilters,
  } = useTradeFilters(trades);

  const handleImportCsv = async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      const file = result.assets[0];
      const response = await fetch(file.uri);
      const csvContent = await response.text();

      const parseResult = await parseCsvFile(csvContent);

      if (parseResult.errors.length > 0) {
        setSnackbarMessage(
          `Import completed with errors. Check console for details.`
        );
        console.error('CSV Import Errors:', parseResult.errors);
      }

      const { imported, skipped } = await importTrades(parseResult.imported);

      setSnackbarMessage(
        `Imported ${imported} trades. Skipped ${skipped + parseResult.skipped} (duplicates/invalid rows)`
      );
      setSnackbarVisible(true);
      setIsImporting(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setSnackbarMessage('Failed to import CSV');
      setSnackbarVisible(true);
      setIsImporting(false);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    await deleteTrade(id);
  };

  const handleEditTrade = (id: string) => {
    router.push(`/add-trade?id=${id}`);
  };

  const styles = createStyles(theme);

  const renderTrade = ({ item }: { item: Trade }) => (
    <TradeCard
      trade={item}
      onDelete={handleDeleteTrade}
      onEdit={handleEditTrade}
    />
  );

  const noResultsFallback = (
    <View style={styles.noResults}>
      <Text variant="bodyLarge" style={styles.noResultsText}>
        No trades match your filters
      </Text>
      <Text
        variant="bodyMedium"
        style={styles.clearFiltersLink}
        onPress={clearFilters}
      >
        Clear filters
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <EmptyState
        data={trades}
        title="No trades yet"
        subtitle="Tap the + button to add your first trade"
      >
        <SearchBar
          value={filters.searchQuery}
          onChangeText={(text) => updateFilter('searchQuery', text)}
          onFilterPress={() => setFilterModalVisible(true)}
          filterCount={activeFilterCount}
        />
        <EmptyState data={filteredTrades} fallback={noResultsFallback}>
          <FlatList
            data={filteredTrades}
            renderItem={renderTrade}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </EmptyState>
      </EmptyState>
      <FAB.Group
        open={fabOpen}
        visible
        icon="plus"
        actions={[
          {
            icon: 'file-upload',
            label: 'Import CSV',
            onPress: isImporting ? () => {} : handleImportCsv,
          },
          {
            icon: 'pencil',
            label: 'Add Trade',
            onPress: () => router.push('/add-trade'),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        fabStyle={styles.fab}
      />
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
      <TradeFilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        filters={filters}
        uniqueStrategies={uniqueStrategies}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    list: {
      padding: 16,
      paddingTop: 8,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
    noResults: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    noResultsText: {
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    clearFiltersLink: {
      color: theme.colors.primary,
    },
  });
