import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Clipboard,
  TextInput,
} from 'react-native';
import { Text, Card, IconButton, Snackbar, Portal } from 'react-native-paper';

import { Button } from '../components/button';
import { DatePickerDialog } from '../components/date-picker-dialog';
import { EmptyState } from '../components/empty-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTrades } from '../hooks/use-trades';
import { useTimezoneStore } from '../store/timezone-store';
import { Trade } from '../types';
import { withAlpha } from '../utils/color-intensity';
import {
  generateDailyDigestMarkdown,
  getTradesForDate,
  TradeContext,
} from '../utils/daily-digest';
import { formatDate } from '../utils/date-format';

export default function DailyDigestScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { trades } = useTrades();
  const { timezone } = useTimezoneStore();

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [contexts, setContexts] = useState<TradeContext[]>([]);
  const [copied, setCopied] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const dailyTrades = useMemo(() => {
    return getTradesForDate(trades, selectedDate);
  }, [trades, selectedDate]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  }, []);

  const handleContextChange = useCallback((tradeId: string, value: string) => {
    setContexts((prev) => {
      const existing = prev.find((c) => c.tradeId === tradeId);
      if (existing) {
        return prev.map((c) =>
          c.tradeId === tradeId ? { ...c, context: value } : c
        );
      }
      return [...prev, { tradeId, context: value }];
    });
  }, []);

  const handleCopy = useCallback(() => {
    if (dailyTrades.length === 0) return;

    const markdown = generateDailyDigestMarkdown(
      dailyTrades,
      selectedDate,
      contexts,
      timezone
    );
    Clipboard.setString(markdown);
    setCopied(true);
    setSnackbarMessage('Copied to clipboard!');
    setSnackbarVisible(true);
    setTimeout(() => setCopied(false), 3000);
  }, [dailyTrades, selectedDate, contexts, timezone]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  const dateLabel = formatDate(selectedDate, timezone);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="calendar" onPress={() => setShowDatePicker(true)} />
        <Text variant="titleLarge" style={styles.title}>
          {dateLabel}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ResponsiveContainer>
          <EmptyState
            data={dailyTrades}
            title="No trades for this day"
            subtitle="Select a different date or import trades"
            icon="calendar-blank"
          >
            <View style={styles.tradesList}>
              {dailyTrades.map((trade) => (
                <TradeDigestCard
                  key={trade.id}
                  trade={trade}
                  context={
                    contexts.find((c) => c.tradeId === trade.id)?.context || ''
                  }
                  onContextChange={handleContextChange}
                  timezone={timezone}
                />
              ))}
            </View>
          </EmptyState>
        </ResponsiveContainer>
      </ScrollView>

      <ResponsiveContainer>
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleCopy}
            disabled={dailyTrades.length === 0}
            icon={copied ? 'check' : 'content-copy'}
            style={styles.copyButton}
          >
            {copied ? 'Copied!' : 'Copy Markdown'}
          </Button>
        </View>
      </ResponsiveContainer>

      <DatePickerDialog
        visible={showDatePicker}
        date={selectedDate}
        onConfirm={handleDateChange}
        onDismiss={() => setShowDatePicker(false)}
        label="Select date"
      />

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleCloseSnackbar}
          duration={3000}
          action={{
            label: 'OK',
            onPress: handleCloseSnackbar,
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </View>
  );
}

function TradeDigestCard({
  trade,
  context,
  onContextChange,
  timezone,
}: {
  trade: Trade;
  context: string;
  onContextChange: (tradeId: string, value: string) => void;
  timezone?: string;
}) {
  const theme = useAppTheme();
  const styles = tradeCardStyles(theme);
  const isProfit = trade.pnl >= 0;
  const sideColor = isProfit ? theme.colors.profit : theme.colors.loss;

  const handleContextTextChange = (text: string) => {
    onContextChange(trade.id, text);
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.tradeHeader}>
          <View style={styles.tradeHeaderLeft}>
            <Text variant="titleLarge" style={styles.symbol}>
              {trade.symbol}
            </Text>
            <View
              style={[
                styles.sideBadge,
                { backgroundColor: withAlpha(sideColor, 0.2) },
              ]}
            >
              <Text
                variant="bodySmall"
                style={[styles.sideBadgeText, { color: sideColor }]}
              >
                {trade.side.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text
            variant="bodyLarge"
            style={[
              styles.pnl,
              { color: isProfit ? theme.colors.profit : theme.colors.loss },
            ]}
          >
            {isProfit ? '+' : ''}${trade.pnl.toFixed(2)} (
            {trade.pnlPercent >= 0 ? '+' : ''}
            {trade.pnlPercent.toFixed(2)}%)
          </Text>
        </View>

        <View style={styles.detailsGrid}>
          <DetailItem label="Qty" value={`${trade.quantity} shares`} />
          <DetailItem label="Entry" value={`$${trade.entryPrice.toFixed(2)}`} />
          <DetailItem label="Exit" value={`$${trade.exitPrice.toFixed(2)}`} />
          <DetailItem
            label="Entry Time"
            value={trade.entryTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: timezone,
            })}
          />
          <DetailItem
            label="Exit Time"
            value={trade.exitTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: timezone,
            })}
          />
          {trade.fees !== undefined && trade.fees > 0 && (
            <DetailItem label="Fees" value={`$${trade.fees.toFixed(2)}`} />
          )}
          {trade.commissions !== undefined && trade.commissions > 0 && (
            <DetailItem
              label="Commissions"
              value={`$${trade.commissions.toFixed(2)}`}
            />
          )}
          {trade.orderType && (
            <DetailItem label="Order Type" value={trade.orderType} />
          )}
          {trade.riskAmount !== undefined && trade.riskAmount > 0 && (
            <DetailItem
              label="Risk"
              value={`$${trade.riskAmount.toFixed(2)}`}
            />
          )}
          {trade.riskAmount !== undefined &&
            trade.riskAmount > 0 &&
            trade.pnl !== undefined && (
              <DetailItem
                label="R-Multiple"
                value={`${(trade.pnl / trade.riskAmount).toFixed(2)}R`}
              />
            )}
          {trade.accountBalanceAfter !== undefined && (
            <DetailItem
              label="Balance After"
              value={`$${trade.accountBalanceAfter.toFixed(2)}`}
            />
          )}
        </View>

        <View style={styles.contextInputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.contextInput}
              placeholder="Add quick context..."
              placeholderTextColor={theme.colors.textSecondary}
              value={context}
              onChangeText={handleContextTextChange}
              multiline
              maxLength={200}
              numberOfLines={1}
            />
            <Text variant="bodySmall" style={styles.contextHint}>
              {context.length}/200
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={detailItemStyles.container}>
      <Text
        variant="bodySmall"
        style={[detailItemStyles.label, { color: theme.colors.textSecondary }]}
      >
        {label}
      </Text>
      <Text variant="bodyMedium" style={detailItemStyles.value}>
        {value}
      </Text>
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
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    title: {
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 48,
    },
    scrollView: {
      flex: 1,
    },
    tradesList: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    footer: {
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    copyButton: {
      width: '100%',
    },
  });

const tradeCardStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      ...theme.elevation[2],
    },
    tradeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    tradeHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    symbol: {
      fontWeight: 'bold',
    },
    sideBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
    },
    sideBadgeText: {
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    pnl: {
      fontWeight: 'bold',
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    contextInputContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.sm,
    },
    inputWrapper: {
      position: 'relative',
    },
    contextInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      paddingRight: 48,
      color: theme.colors.onSurface,
      fontSize: 14,
      textAlignVertical: 'top',
    },
    contextHint: {
      position: 'absolute',
      right: theme.spacing.sm,
      top: theme.spacing.sm,
      color: theme.colors.textTertiary,
    },
  });

const detailItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 140,
    flex: 1,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
});
