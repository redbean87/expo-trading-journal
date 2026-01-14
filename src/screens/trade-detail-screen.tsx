import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Chip, Portal, Dialog } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useTrade, useDeleteTrade } from '../hooks/use-trades';
import { formatDateTime } from '../utils/date-format';

export default function TradeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { trade, isLoading, notFound } = useTrade(params.id || null);
  const deleteTrade = useDeleteTrade();
  const theme = useAppTheme();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const styles = createStyles(theme);

  const handleEdit = () => {
    router.push(`/add-trade?id=${params.id}`);
  };

  const handleDelete = async () => {
    if (params.id) {
      await deleteTrade(params.id);
      setDeleteDialogVisible(false);
      router.back();
    }
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

  const isProfit = trade.pnl >= 0;

  return (
    <>
      <Stack.Screen options={{ title: trade.symbol }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="displaySmall" style={styles.symbol}>
                {trade.symbol}
              </Text>
              <Chip
                style={[
                  styles.sideChip,
                  {
                    backgroundColor:
                      trade.side === 'long'
                        ? theme.colors.profit + '20'
                        : theme.colors.loss + '20',
                  },
                ]}
                textStyle={{
                  color:
                    trade.side === 'long'
                      ? theme.colors.profit
                      : theme.colors.loss,
                }}
              >
                {trade.side.toUpperCase()}
              </Chip>
            </View>
            <View style={styles.headerRight}>
              <Text
                variant="headlineMedium"
                style={[
                  styles.pnl,
                  { color: isProfit ? theme.colors.profit : theme.colors.loss },
                ]}
              >
                {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
              </Text>
              <Text
                variant="bodyLarge"
                style={{
                  color: isProfit ? theme.colors.profit : theme.colors.loss,
                }}
              >
                {isProfit ? '+' : ''}
                {trade.pnlPercent.toFixed(2)}%
              </Text>
            </View>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Position Details
              </Text>
              <DetailRow label="Quantity" value={`${trade.quantity} shares`} />
              <DetailRow
                label="Entry Price"
                value={`$${trade.entryPrice.toFixed(2)}`}
              />
              <DetailRow
                label="Exit Price"
                value={`$${trade.exitPrice.toFixed(2)}`}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Timing
              </Text>
              <DetailRow
                label="Entry"
                value={formatDateTime(trade.entryTime)}
              />
              <DetailRow label="Exit" value={formatDateTime(trade.exitTime)} />
            </Card.Content>
          </Card>

          {trade.strategy && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Strategy
                </Text>
                <Text variant="bodyLarge">{trade.strategy}</Text>
              </Card.Content>
            </Card>
          )}

          {trade.notes && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Notes
                </Text>
                <Text variant="bodyLarge" style={styles.notes}>
                  {trade.notes}
                </Text>
              </Card.Content>
            </Card>
          )}

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleEdit}
              style={styles.actionButton}
              icon="pencil"
            >
              Edit Trade
            </Button>
            <Button
              mode="outlined"
              onPress={() => setDeleteDialogVisible(true)}
              style={styles.actionButton}
              textColor={theme.colors.loss}
              icon="delete"
            >
              Delete Trade
            </Button>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Trade</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this {trade.symbol} trade? This
              action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleDelete} textColor={theme.colors.loss}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  const theme = useAppTheme();
  return (
    <View style={detailRowStyles.row}>
      <Text variant="bodyMedium" style={{ color: theme.colors.textSecondary }}>
        {label}
      </Text>
      <Text variant="bodyLarge">{value}</Text>
    </View>
  );
}

const detailRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    symbol: {
      fontWeight: 'bold',
    },
    sideChip: {
      height: 28,
    },
    pnl: {
      fontWeight: 'bold',
    },
    card: {
      marginBottom: 16,
    },
    sectionTitle: {
      marginBottom: 8,
      color: theme.colors.primary,
    },
    notes: {
      lineHeight: 24,
    },
    actions: {
      marginTop: 8,
      gap: 12,
    },
    actionButton: {
      paddingVertical: 4,
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
