import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar } from 'react-native-paper';

import { Button } from '../components/button';
import { DuplicateTradeCard } from '../components/duplicate-trade-card';
import { useAppTheme } from '../hooks/use-app-theme';
import { useDuplicateDetection } from '../hooks/use-duplicate-detection';
import { useMergeTrades, useDeleteTrade } from '../hooks/use-trades';
import { useTrades } from '../hooks/use-trades';
import { useDuplicateReviewStore } from '../store/duplicate-review-store';

export default function DuplicateReviewScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const router = useRouter();
  const { trades } = useTrades();
  const pairs = useDuplicateDetection(trades);
  const mergeTrades = useMergeTrades();
  const deleteTrade = useDeleteTrade();

  const { endReview, removePair } = useDuplicateReviewStore();

  const handleBack = () => {
    endReview();
    router.back();
  };

  const getDifferingFields = (
    existing: (typeof pairs)[0]['existing'],
    imported: (typeof pairs)[0]['imported']
  ) => {
    const diffs: string[] = [];
    if (existing.entryTime.getTime() !== imported.entryTime.getTime()) {
      diffs.push('Entry Time');
    }
    if ((existing.fees ?? 0) !== (imported.fees ?? 0)) {
      diffs.push('Fees');
    }
    if ((existing.commissions ?? 0) !== (imported.commissions ?? 0)) {
      diffs.push('Commissions');
    }
    if (existing.orderType !== imported.orderType) {
      diffs.push('Order Type');
    }
    if ((existing.importId ?? '') !== (imported.importId ?? '')) {
      diffs.push('Import ID');
    }
    if (existing.importedFrom !== imported.importedFrom) {
      diffs.push('Source');
    }
    return diffs;
  };

  const handleMerge = async (pair: (typeof pairs)[0]) => {
    try {
      await mergeTrades(pair.existing.id, pair.imported.id);
      removePair(pair.existing.id, pair.imported.id);
    } catch (error) {
      console.error('Failed to merge trades:', error);
    }
  };

  const handleKeepBoth = (pair: (typeof pairs)[0]) => {
    removePair(pair.existing.id, pair.imported.id);
  };

  const handleDeleteImported = async (pair: (typeof pairs)[0]) => {
    try {
      await deleteTrade(pair.imported.id);
      removePair(pair.existing.id, pair.imported.id);
    } catch (error) {
      console.error('Failed to delete trade:', error);
    }
  };

  const handleDeleteExisting = async (pair: (typeof pairs)[0]) => {
    try {
      await deleteTrade(pair.existing.id);
      removePair(pair.existing.id, pair.imported.id);
    } catch (error) {
      console.error('Failed to delete trade:', error);
    }
  };

  if (pairs.length === 0) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title="Review Duplicates" />
        </Appbar.Header>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Duplicates Found</Text>
          <Text style={styles.emptySubtitle}>
            All potential duplicates have been reviewed.
          </Text>
          <Button
            mode="contained"
            onPress={handleBack}
            style={styles.doneButton}
          >
            Done
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content
          title={`Review Duplicates (${pairs.length} remaining)`}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {pairs.map((pair, index) => {
          const diffs = getDifferingFields(pair.existing, pair.imported);

          return (
            <View
              key={`${pair.existing.id}-${pair.imported.id}`}
              style={styles.pairContainer}
            >
              <Text style={styles.pairNumber}>
                Duplicate {index + 1} of {pairs.length}
              </Text>

              <View style={styles.cardsRow}>
                <DuplicateTradeCard
                  trade={pair.existing}
                  label="Existing"
                  highlightFields={diffs}
                />
                <DuplicateTradeCard
                  trade={pair.imported}
                  label="New Import"
                  highlightFields={diffs}
                />
              </View>

              <View style={styles.actionsContainer}>
                <Button
                  mode="contained"
                  onPress={() => handleMerge(pair)}
                  style={styles.mergeButton}
                >
                  Merge Trades
                </Button>

                <View style={styles.secondaryActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleKeepBoth(pair)}
                    style={styles.secondaryButton}
                  >
                    Keep Both
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDeleteImported(pair)}
                    textColor={theme.colors.error}
                    style={[styles.secondaryButton, styles.deleteButton]}
                  >
                    Delete New
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDeleteExisting(pair)}
                    textColor={theme.colors.error}
                    style={[styles.secondaryButton, styles.deleteButton]}
                  >
                    Delete Old
                  </Button>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    pairContainer: {
      padding: theme.spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border,
    },
    pairNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    cardsRow: {
      flexDirection: 'row',
      marginHorizontal: -theme.spacing.xs,
    },
    actionsContainer: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    mergeButton: {
      marginBottom: theme.spacing.sm,
    },
    secondaryActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    secondaryButton: {
      flex: 1,
    },
    deleteButton: {
      borderColor: theme.colors.error,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    doneButton: {
      minWidth: 120,
    },
  });
}
