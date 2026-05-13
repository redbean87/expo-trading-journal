import { useIsFocused } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import {
  FAB,
  Snackbar,
  Portal,
  Text,
  IconButton,
  Dialog,
  Checkbox,
} from 'react-native-paper';

import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { LoadingState } from '../components/loading-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { SearchBar } from '../components/search-bar';
import { TradeCard } from '../components/trade-card';
import { useAppTheme } from '../hooks/use-app-theme';
import { useBreakpoint } from '../hooks/use-breakpoint';
import {
  PnlFilter,
  TradeFilters,
  useTradeFilters,
} from '../hooks/use-trade-filters';
import { useTrades, useImportTrades } from '../hooks/use-trades';
import { useProfileStore } from '../store/profile-store';
import { Trade, TradeSide } from '../types';
import { formatDateKey } from '../utils/calendar-helpers';
import { tradesToCsv, generateExportFilename } from '../utils/csv-export';
import { ImportResult, parseCsvFile } from '../utils/csv-import';
import { downloadFile } from '../utils/file-download';
import {
  isTosAccountStatement,
  parseTosAccountStatement,
} from '../utils/tos-import';
import { TradeDetailPanel } from './trades/trade-detail-panel';
import { TradeFilterModal } from './trades/trade-filter-modal';

type TradeSearchParams = {
  id?: string;
  edit?: string;
  dateFrom?: string;
  dateTo?: string;
  side?: string;
  pnl?: string;
  strategy?: string;
  q?: string;
};

function parseLocalDate(dateStr: string): Date | null {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month - 1, day);
}

function parseFiltersFromParams(
  params: TradeSearchParams
): Partial<TradeFilters> {
  const filters: Partial<TradeFilters> = {};

  if (params.dateFrom) {
    const date = parseLocalDate(params.dateFrom);
    if (date) filters.dateFrom = date;
  }
  if (params.dateTo) {
    const date = parseLocalDate(params.dateTo);
    if (date) filters.dateTo = date;
  }

  if (params.side === 'long' || params.side === 'short') {
    filters.side = params.side as TradeSide;
  }

  if (params.pnl === 'winning' || params.pnl === 'losing') {
    filters.pnl = params.pnl as PnlFilter;
  }

  if (params.strategy) {
    filters.strategy = params.strategy;
  }

  if (params.q) {
    filters.searchQuery = params.q;
  }

  return filters;
}

export default function TradesScreen() {
  const { trades, isLoading } = useTrades();
  const importTrades = useImportTrades();
  const router = useRouter();
  const theme = useAppTheme();
  const { isDesktop } = useBreakpoint();
  const isFocused = useIsFocused();
  const { defaultRiskPercent } = useProfileStore();

  const params = useLocalSearchParams<TradeSearchParams>();

  // Derive selection and edit state from URL params (single source of truth)
  const selectedTradeId = params.id || null;
  const isEditing = params.edit === 'true';

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fabAnimValue = useRef(new Animated.Value(0)).current;
  const [pendingImport, setPendingImport] = useState<ImportResult | null>(null);
  const [applyRiskOnImport, setApplyRiskOnImport] = useState(true);

  useEffect(() => {
    Animated.timing(fabAnimValue, {
      toValue: fabOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fabOpen, fabAnimValue]);

  const {
    filters,
    setFilters,
    filteredTrades,
    uniqueStrategies,
    activeFilterCount,
    updateFilter,
    clearFilters: clearFiltersState,
  } = useTradeFilters(trades);

  // Sync URL params to filter state on mount (deep-linking support)
  useEffect(() => {
    const urlFilters = parseFiltersFromParams(params);
    const hasUrlFilters = Object.keys(urlFilters).length > 0;

    if (hasUrlFilters) {
      setFilters((prev) => ({ ...prev, ...urlFilters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync non-search filter changes to URL
  useEffect(() => {
    const newParams: Record<string, string> = {};

    if (filters.dateFrom) {
      newParams.dateFrom = formatDateKey(filters.dateFrom);
    }
    if (filters.dateTo) {
      newParams.dateTo = formatDateKey(filters.dateTo);
    }

    if (filters.side !== 'all') {
      newParams.side = filters.side;
    }

    if (filters.pnl !== 'all') {
      newParams.pnl = filters.pnl;
    }

    if (filters.strategy !== 'all') {
      newParams.strategy = filters.strategy;
    }

    router.setParams(newParams);
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.side,
    filters.pnl,
    filters.strategy,
    router,
  ]);

  // Sync search query to URL on blur
  const handleSearchBlur = useCallback(() => {
    router.setParams({ q: filters.searchQuery || undefined });
  }, [filters.searchQuery, router]);

  const clearFilters = () => {
    clearFiltersState();
    router.setParams({
      dateFrom: undefined,
      dateTo: undefined,
      side: undefined,
      pnl: undefined,
      strategy: undefined,
      q: undefined,
    });
  };

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

      const parseResult = isTosAccountStatement(csvContent)
        ? parseTosAccountStatement(csvContent)
        : await parseCsvFile(csvContent);

      if (parseResult.errors.length > 0) {
        console.error('CSV Import Errors:', parseResult.errors);
      }

      setIsImporting(false);
      setApplyRiskOnImport(true);
      setPendingImport(parseResult);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setSnackbarMessage('Failed to import CSV');
      setSnackbarVisible(true);
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingImport) return;
    try {
      setIsImporting(true);
      setPendingImport(null);

      let tradesToImport = pendingImport.imported;
      if (applyRiskOnImport && defaultRiskPercent != null) {
        tradesToImport = tradesToImport.map((trade) => ({
          ...trade,
          riskAmount:
            Math.round(
              trade.entryPrice *
                trade.quantity *
                (defaultRiskPercent / 100) *
                100
            ) / 100,
        }));
      }

      const { imported, skipped, updated } = await importTrades(tradesToImport);

      const totalSkipped = skipped + pendingImport.skipped;
      const parts = [`Imported ${imported} trades`];
      if (updated > 0) parts.push(`${updated} updated`);
      if (totalSkipped > 0) parts.push(`${totalSkipped} skipped`);
      if (pendingImport.unmatchedBuys) {
        parts.push(
          `${pendingImport.unmatchedBuys} open position(s) not yet closed`
        );
      }
      if (pendingImport.unmatchedSells) {
        parts.push(
          `${pendingImport.unmatchedSells} sell(s) with no prior buy in this file`
        );
      }
      if (pendingImport.errors.length > 0) {
        parts.push('some rows had errors');
      }
      setSnackbarMessage(parts.join(' · '));
      setSnackbarVisible(true);
      setIsImporting(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setSnackbarMessage('Failed to import CSV');
      setSnackbarVisible(true);
      setIsImporting(false);
    }
  };

  const handleSelectTrade = (id: string) => {
    if (isDesktop) {
      router.replace(`/trades/${id}`);
    }
  };

  const handleClearSelection = () => {
    router.replace('/trades');
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
      onSelect={isDesktop ? handleSelectTrade : undefined}
      isSelected={isDesktop && selectedTradeId === item.id}
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

  const handleAddTrade = () => {
    router.push('/add-trade');
  };

  const listContent = (
    <EmptyState
      data={trades}
      title="No trades yet"
      subtitle="Start tracking your trades to analyze your performance"
      icon="chart-line-variant"
      action={{
        label: 'Add Trade',
        onPress: handleAddTrade,
        icon: 'plus',
      }}
    >
      <SearchBar
        value={filters.searchQuery}
        onChangeText={(text) => updateFilter('searchQuery', text)}
        onBlur={handleSearchBlur}
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
  );

  return (
    <LoadingState isLoading={isLoading}>
      <View style={styles.container}>
        {isDesktop ? (
          <View style={styles.masterDetailContainer}>
            <View style={styles.masterPane}>{listContent}</View>
            <View style={styles.detailPane}>
              <TradeDetailPanel
                tradeId={selectedTradeId}
                onClose={handleClearSelection}
                isEditing={isEditing}
                onEditStart={() => {
                  if (selectedTradeId) {
                    router.setParams({ edit: 'true' });
                  }
                }}
                onEditComplete={() => {
                  router.setParams({ edit: undefined });
                }}
              />
            </View>
          </View>
        ) : (
          <ResponsiveContainer>{listContent}</ResponsiveContainer>
        )}
        {isFocused && (
          <Portal>
            <View
              style={[
                styles.fabContainer,
                isDesktop && { bottom: theme.spacing.xl },
              ]}
            >
              <Animated.View
                style={{
                  opacity: fabAnimValue,
                  transform: [
                    {
                      translateY: fabAnimValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                  pointerEvents: fabOpen ? 'auto' : 'none',
                }}
              >
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
              </Animated.View>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: fabAnimValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '45deg'],
                      }),
                    },
                  ],
                }}
              >
                <FAB
                  icon="plus"
                  style={styles.fab}
                  onPress={() => setFabOpen(!fabOpen)}
                />
              </Animated.View>
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
          onApplyFilters={setFilters}
          onClearFilters={clearFilters}
        />
        <Portal>
          <Dialog
            visible={pendingImport !== null}
            onDismiss={() => setPendingImport(null)}
            style={styles.importDialog}
          >
            <Dialog.Title>Import Trades</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                Found {pendingImport?.imported.length ?? 0} trade
                {(pendingImport?.imported.length ?? 0) !== 1 ? 's' : ''} to
                import
                {(pendingImport?.skipped ?? 0) > 0
                  ? ` (${pendingImport?.skipped} rows skipped)`
                  : ''}
                .
              </Text>
              {defaultRiskPercent != null && (
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setApplyRiskOnImport((v) => !v)}
                  activeOpacity={0.7}
                >
                  <Checkbox
                    status={applyRiskOnImport ? 'checked' : 'unchecked'}
                    onPress={() => setApplyRiskOnImport((v) => !v)}
                  />
                  <Text variant="bodyMedium" style={styles.checkboxLabel}>
                    Apply default risk ({defaultRiskPercent}% of position)
                  </Text>
                </TouchableOpacity>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setPendingImport(null)}>Cancel</Button>
              <Button
                mode="contained"
                onPress={handleConfirmImport}
                disabled={(pendingImport?.imported.length ?? 0) === 0}
              >
                Import
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    masterDetailContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    masterPane: {
      flex: 4,
      maxWidth: 520,
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline,
    },
    detailPane: {
      flex: 6,
    },
    list: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    fabContainer: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: 80,
      alignItems: 'flex-end',
    },
    fab: {
      backgroundColor: theme.colors.primary,
    },
    pillButton: {
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      elevation: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    pillButtonSecond: {
      marginBottom: theme.spacing.md,
    },
    pillContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: theme.spacing.md,
    },
    pillIcon: {
      margin: 0,
    },
    pillLabel: {
      color: theme.colors.onSurface,
      marginLeft: theme.spacing.xs,
    },
    noResults: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xxl,
    },
    noResultsText: {
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    clearFiltersLink: {
      color: theme.colors.primary,
    },
    importDialog: {
      maxWidth: 600,
      alignSelf: 'center',
      width: '90%',
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    checkboxLabel: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
  });
