import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FAB, Snackbar, Portal, Text, IconButton } from 'react-native-paper';

import { EmptyState } from '../components/empty-state';
import { LoadingState } from '../components/loading-state';
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
import { tradesToCsv, generateExportFilename } from '../utils/csv-export';
import { parseCsvFile } from '../utils/csv-import';
import { downloadFile } from '../utils/file-download';
import { TradeFilterModal } from './trades/trade-filter-modal';

export default function TradesScreen() {
  const { trades, isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();
  const importTrades = useImportTrades();
  const router = useRouter();
  const theme = useAppTheme();
  const isFocused = useIsFocused();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    filters,
    filteredTrades,
    uniqueStrategies,
    activeFilterCount,
    updateFilter,
    clearFilters,
  } = useTradeFilters(trades);

  const handleExportCsv = async () => {
    if (filteredTrades.length === 0) {
      setSnackbarMessage('No trades to export');
      setSnackbarVisible(true);
      return;
    }

    try {
      setIsExporting(true);
      const csvContent = tradesToCsv(filteredTrades);
      const filename = generateExportFilename();
      const result = await downloadFile(csvContent, filename);

      if (result.success) {
        setSnackbarMessage(`Exported ${filteredTrades.length} trades`);
      } else {
        setSnackbarMessage(result.error ?? 'Export failed');
      }
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setSnackbarMessage('Failed to export CSV');
      setSnackbarVisible(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCsv = async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/comma-separated-values',
          'application/csv',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      const file = result.assets[0];

      // Use FileSystem on native platforms, fetch on web
      let csvContent: string;
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        csvContent = await response.text();
      } else {
        const fsFile = new File(file.uri);
        csvContent = await fsFile.text();
      }

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
    router.push(`/edit-trade/${id}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Brief delay for visual feedback (Convex auto-syncs)
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
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
    <LoadingState isLoading={isLoading}>
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
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </EmptyState>
        </EmptyState>
        {isFocused && (
          <Portal>
            <View style={styles.fabContainer}>
              {fabOpen && (
                <>
                  <TouchableOpacity
                    style={styles.pillButton}
                    onPress={() => {
                      setFabOpen(false);
                      router.push('/add-trade');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pillContent}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        iconColor={theme.colors.onSurface}
                        style={styles.pillIcon}
                      />
                      <Text variant="labelLarge" style={styles.pillLabel}>
                        Add Trade
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pillButton, styles.pillButtonSecond]}
                    onPress={() => {
                      if (!isImporting) {
                        setFabOpen(false);
                        handleImportCsv();
                      }
                    }}
                    activeOpacity={0.7}
                    disabled={isImporting}
                  >
                    <View style={styles.pillContent}>
                      <IconButton
                        icon="file-upload"
                        size={20}
                        iconColor={theme.colors.onSurface}
                        style={styles.pillIcon}
                      />
                      <Text variant="labelLarge" style={styles.pillLabel}>
                        Import CSV
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pillButton, styles.pillButtonSecond]}
                    onPress={() => {
                      if (!isExporting) {
                        setFabOpen(false);
                        handleExportCsv();
                      }
                    }}
                    activeOpacity={0.7}
                    disabled={isExporting || filteredTrades.length === 0}
                  >
                    <View style={styles.pillContent}>
                      <IconButton
                        icon="file-download"
                        size={20}
                        iconColor={theme.colors.onSurface}
                        style={styles.pillIcon}
                      />
                      <Text variant="labelLarge" style={styles.pillLabel}>
                        Export CSV
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
              <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setFabOpen(!fabOpen)}
              />
            </View>
          </Portal>
        )}
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
    </LoadingState>
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
    fabContainer: {
      position: 'absolute',
      right: 16,
      bottom: 80,
      alignItems: 'flex-end',
    },
    fab: {
      backgroundColor: theme.colors.primary,
    },
    pillButton: {
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      paddingHorizontal: 4,
      paddingVertical: 4,
      elevation: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    pillButtonSecond: {
      marginBottom: 12,
    },
    pillContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 12,
    },
    pillIcon: {
      margin: 0,
    },
    pillLabel: {
      color: theme.colors.onSurface,
      marginLeft: 4,
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
