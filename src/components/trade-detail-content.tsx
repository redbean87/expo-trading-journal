import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Portal, Dialog, Menu, IconButton } from 'react-native-paper';

import { AttachmentGallery } from './attachment-gallery';
import { Button } from './button';
import { Chip } from './chip';
import { LinkedText } from './linked-text';
import { SectionCard } from './section-card';
import { useAppTheme } from '../hooks/use-app-theme';
import { useAttachments } from '../hooks/use-attachments';
import { Trade } from '../types';
import { withAlpha } from '../utils/color-intensity';
import { formatDateTime } from '../utils/date-format';

type TradeDetailContentProps = {
  trade: Trade;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onDeleteComplete?: () => void;
};

export function TradeDetailContent({
  trade,
  onClose,
  onEdit,
  onDelete,
  onDeleteComplete,
}: TradeDetailContentProps) {
  const theme = useAppTheme();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { attachments } = useAttachments(trade.id);

  const styles = createStyles(theme);

  const handleDelete = async () => {
    await onDelete();
    setDeleteDialogVisible(false);
    onDeleteComplete?.();
  };

  const isProfit = trade.pnl >= 0;
  const sideColor = isProfit ? theme.colors.profit : theme.colors.loss;

  return (
    <>
      <View style={styles.topBar}>
        <IconButton icon="close" onPress={onClose} />
        <View style={styles.topBarActions}>
          <IconButton icon="pencil" onPress={onEdit} />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setDeleteDialogVisible(true);
              }}
              title="Delete Trade"
              leadingIcon="delete"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="displaySmall" style={styles.symbol}>
                {trade.symbol}
              </Text>
              <View
                style={[
                  styles.sideBadge,
                  { backgroundColor: withAlpha(sideColor, 0.12) },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={[styles.sideBadgeText, { color: sideColor }]}
                >
                  {trade.side.toUpperCase()}
                </Text>
              </View>
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
            {trade.fees !== undefined && trade.fees > 0 && (
              <DetailRow label="Fees" value={`$${trade.fees.toFixed(2)}`} />
            )}
            {trade.commissions !== undefined && trade.commissions > 0 && (
              <DetailRow
                label="Commissions"
                value={`$${trade.commissions.toFixed(2)}`}
              />
            )}
            {trade.orderType && (
              <DetailRow label="Order Type" value={trade.orderType} />
            )}
            {trade.accountBalanceAfter !== undefined && (
              <DetailRow
                label="Balance After"
                value={`$${trade.accountBalanceAfter.toFixed(2)}`}
              />
            )}
          </SectionCard>

          <SectionCard title="Timing">
            <DetailRow label="Entry" value={formatDateTime(trade.entryTime)} />
            <DetailRow label="Exit" value={formatDateTime(trade.exitTime)} />
          </SectionCard>

          {(trade.strategy || trade.marketCondition || trade.htfContext) && (
            <SectionCard title="Trade Setup">
              {trade.strategy && (
                <DetailRow label="Strategy" value={trade.strategy} />
              )}
              {trade.marketCondition && (
                <DetailRow
                  label="Market Condition"
                  value={trade.marketCondition}
                />
              )}
              {trade.htfContext && (
                <DetailRow label="HTF Context" value={trade.htfContext} />
              )}
            </SectionCard>
          )}

          {(trade.confidence !== undefined || trade.psychology) && (
            <SectionCard title="Performance">
              {trade.confidence !== undefined && (
                <DetailRow label="Confidence" value={`${trade.confidence}/5`} />
              )}
              {trade.psychology && (
                <DetailRow
                  label="Psychology"
                  value={trade.psychology
                    .split(',')
                    .map((t) => t.trim())
                    .join(', ')}
                />
              )}
            </SectionCard>
          )}

          {(trade.whatWorked || trade.whatFailed || trade.ruleViolation) && (
            <SectionCard title="Review">
              {trade.whatWorked && (
                <DetailRow
                  label="What Worked"
                  value={trade.whatWorked
                    .split(',')
                    .map((t) => t.trim())
                    .join(', ')}
                />
              )}
              {trade.whatFailed && (
                <DetailRow
                  label="What Didn't Work"
                  value={trade.whatFailed
                    .split(',')
                    .map((t) => t.trim())
                    .join(', ')}
                />
              )}
              {trade.ruleViolation && (
                <View style={styles.mistakeRow}>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Mistake
                  </Text>
                  <Chip
                    style={styles.mistakeChip}
                    icon="alert-circle"
                    textStyle={{ color: theme.colors.loss }}
                    compact
                  >
                    {trade.ruleViolation}
                  </Chip>
                </View>
              )}
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
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
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
            <Button onPress={handleDelete} textColor={theme.colors.error}>
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
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
      paddingTop: 8,
      backgroundColor: theme.colors.background,
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
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
    sideBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    sideBadgeText: {
      fontWeight: '600',
    },
    pnl: {
      fontWeight: 'bold',
    },
    notes: {
      lineHeight: 24,
    },
    mistakeChip: {
      alignSelf: 'flex-start',
      backgroundColor: withAlpha(theme.colors.loss, 0.12),
    },
    mistakeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    dialog: {
      maxWidth: 600,
      alignSelf: 'center',
    },
  });
