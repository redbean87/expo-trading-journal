import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button } from 'react-native-paper';

import { TradeDetailContent } from '../components/trade-detail-content';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTrade, useDeleteTrade } from '../hooks/use-trades';

export default function TradeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { trade, isLoading, notFound } = useTrade(params.id || null);
  const deleteTrade = useDeleteTrade();
  const theme = useAppTheme();

  const styles = createStyles(theme);

  const handleEdit = () => {
    router.push(`/edit-trade/${params.id}`);
  };

  const handleDelete = async () => {
    if (params.id) {
      await deleteTrade(params.id);
    }
  };

  const handleDeleteComplete = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Trade Details' }} />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading trade...</Text>
        </View>
      </>
    );
  }

  if (notFound || !trade) {
    return (
      <>
        <Stack.Screen options={{ title: 'Trade Details' }} />
        <View style={[styles.container, styles.centerContent]}>
          <Text variant="headlineSmall" style={styles.errorText}>
            Trade Not Found
          </Text>
          <Text variant="bodyMedium" style={styles.errorSubtext}>
            This trade doesn&apos;t exist or has been deleted.
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: trade.symbol }} />
      <TradeDetailContent
        trade={trade}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteComplete={handleDeleteComplete}
      />
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
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
