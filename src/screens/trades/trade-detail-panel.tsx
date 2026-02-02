import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';

import { TradeDetailContent } from '../../components/trade-detail-content';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useTrade, useDeleteTrade } from '../../hooks/use-trades';

type TradeDetailPanelProps = {
  tradeId: string | null;
  onClose: () => void;
};

export function TradeDetailPanel({ tradeId, onClose }: TradeDetailPanelProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const { trade, isLoading, notFound } = useTrade(tradeId);
  const deleteTrade = useDeleteTrade();

  const styles = createStyles(theme);

  const handleEdit = () => {
    if (tradeId) {
      router.push(`/edit-trade/${tradeId}`);
    }
  };

  const handleDelete = async () => {
    if (tradeId) {
      await deleteTrade(tradeId);
    }
  };

  if (!tradeId) {
    return (
      <View style={styles.emptyContainer}>
        <IconButton
          icon="file-document-outline"
          size={64}
          iconColor={theme.colors.outline}
        />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Select a trade
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Click on a trade from the list to view details
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading trade...</Text>
      </View>
    );
  }

  if (notFound || !trade) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.errorText}>
          Trade Not Found
        </Text>
        <Text variant="bodyMedium" style={styles.errorSubtext}>
          This trade doesn&apos;t exist or has been deleted.
        </Text>
        <Button mode="contained" onPress={onClose}>
          Close
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={onClose} />
      </View>
      <TradeDetailContent
        trade={trade}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteComplete={onClose}
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
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 8,
      paddingTop: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: theme.colors.background,
    },
    emptyTitle: {
      color: theme.colors.onSurface,
      marginTop: 8,
    },
    emptySubtitle: {
      color: theme.colors.outline,
      textAlign: 'center',
      marginTop: 8,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 16,
      color: theme.colors.textSecondary,
    },
    errorText: {
      color: theme.colors.loss,
      marginBottom: 8,
    },
    errorSubtext: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
  });
