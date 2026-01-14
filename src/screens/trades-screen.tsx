import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Snackbar, Portal } from 'react-native-paper';

import { EmptyState } from '../components/empty-state';
import { TradeCard } from '../components/trade-card';
import { useAppTheme } from '../hooks/use-app-theme';
import {
  useTrades,
  useDeleteTrade,
  useImportTrades,
} from '../hooks/use-trades';
import { Trade } from '../types';
import { parseCsvFile } from '../utils/csv-import';

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

  return (
    <View style={styles.container}>
      <EmptyState
        data={trades}
        title="No trades yet"
        subtitle="Tap the + button to add your first trade"
      >
        <FlatList
          data={trades}
          renderItem={renderTrade}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
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
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
  });
