import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Portal, Dialog } from 'react-native-paper';

import { AttachmentGallery } from './attachment-gallery';
import { Chip } from './chip';
import { LinkedText } from './linked-text';
import { SectionCard } from './section-card';
import { getMistakeCategoryLabel } from '../constants/mistake-categories';
import { useAppTheme } from '../hooks/use-app-theme';
import { useAttachments } from '../hooks/use-attachments';
import { Trade } from '../types';
import { formatDateTime } from '../utils/date-format';
import { categorizeMistake } from '../utils/mistake-categorization';

type TradeDetailContentProps = {
  trade: Trade;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onDeleteComplete?: () => void;
};

export function TradeDetailContent({
  trade,
  onEdit,
  onDelete,
  onDeleteComplete,
}: TradeDetailContentProps) {
  const theme = useAppTheme();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const { attachments } = useAttachments(trade.id);

  const styles = createStyles(theme);

  const handleDelete = async () => {
    await onDelete();
    setDeleteDialogVisible(false);
    onDeleteComplete?.();
  };

  const isProfit = trade.pnl >= 0;

  return (
    <>
      <ScrollView style={styles.scrollContainer}>
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
                  {
                    color: isProfit ? theme.colors.profit : theme.colors.loss,
                  },
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

          <SectionCard title="Position Details">
            <DetailRow label="Quantity" value={`${trade.quantity} shares`} />
            <DetailRow
              label="Entry Price"
              value={`$${trade.entryPrice.toFixed(2)}`}
            />
            <DetailRow
              label="Exit Price"
              value={`$${trade.exitPrice.toFixed(2)}`}
            />
          </SectionCard>

          <SectionCard title="Timing">
            <DetailRow label="Entry" value={formatDateTime(trade.entryTime)} />
            <DetailRow label="Exit" value={formatDateTime(trade.exitTime)} />
          </SectionCard>

          {trade.strategy && (
            <SectionCard title="Strategy">
              <Text variant="bodyLarge">{trade.strategy}</Text>
            </SectionCard>
          )}

          {trade.psychology && (
            <SectionCard title="Psychology">
              <Chip style={styles.psychologyChip}>{trade.psychology}</Chip>
            </SectionCard>
          )}

          {trade.whatWorked && (
            <SectionCard title="What Worked">
              <LinkedText variant="bodyLarge" style={styles.notes}>
                {trade.whatWorked}
              </LinkedText>
            </SectionCard>
          )}

          {trade.whatFailed && (
            <SectionCard title="What Didn't Work">
              <LinkedText variant="bodyLarge" style={styles.notes}>
                {trade.whatFailed}
              </LinkedText>
            </SectionCard>
          )}

          {trade.ruleViolation && (
            <SectionCard title="Mistake / Rule Violation">
              <View style={styles.ruleViolationContent}>
                <Chip
                  style={styles.mistakeChip}
                  icon="alert-circle"
                  textStyle={{ color: theme.colors.loss }}
                >
                  {getMistakeCategoryLabel(
                    categorizeMistake(trade.ruleViolation) ?? 'other'
                  )}
                </Chip>
                <LinkedText variant="bodyLarge" style={styles.notes}>
                  {trade.ruleViolation}
                </LinkedText>
              </View>
            </SectionCard>
          )}

          {trade.notes && (
            <SectionCard title="Notes">
              <LinkedText variant="bodyLarge" style={styles.notes}>
                {trade.notes}
              </LinkedText>
            </SectionCard>
          )}

          {attachments.length > 0 && (
            <SectionCard title="Screenshots">
              <AttachmentGallery attachments={attachments} />
            </SectionCard>
          )}

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={onEdit}
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
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
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
    notes: {
      lineHeight: 24,
    },
    psychologyChip: {
      alignSelf: 'flex-start',
    },
    ruleViolationContent: {
      gap: 12,
    },
    mistakeChip: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.loss + '20',
    },
    actions: {
      marginTop: 8,
      gap: 12,
    },
    actionButton: {
      paddingVertical: 4,
    },
  });
