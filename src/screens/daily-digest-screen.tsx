import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Clipboard,
  TextInput,
} from 'react-native';
import { Text, Card, IconButton, Switch } from 'react-native-paper';

import { Button } from '../components/button';
import { Chip } from '../components/chip';
import { DatePickerDialog } from '../components/date-picker-dialog';
import { EmptyState } from '../components/empty-state';
import { ResponsiveContainer } from '../components/responsive-container';
import { useAppTheme } from '../hooks/use-app-theme';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { useTrades } from '../hooks/use-trades';
import { useSnackbarStore } from '../store/snackbar-store';
import { useTimezoneStore } from '../store/timezone-store';
import { Trade } from '../types';
import { withAlpha } from '../utils/color-intensity';
import {
  generateDailyDigestMarkdown,
  generateScreenshotFilename,
  getTradesForDate,
  TradeContext,
} from '../utils/daily-digest';
import { formatDate } from '../utils/date-format';

export default function DailyDigestScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { isDesktop } = useBreakpoint();
  const { trades } = useTrades();
  const { timezone } = useTimezoneStore();

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [contexts, setContexts] = useState<TradeContext[]>([]);
  const [mode, setMode] = useState<'simple' | 'structured'>('structured');
  const { show: showSnackbar } = useSnackbarStore();
  const [copied, setCopied] = useState(false);

  const dailyTrades = useMemo(() => {
    const dayTrades = getTradesForDate(trades, selectedDate);
    return dayTrades.sort(
      (a, b) => a.entryTime.getTime() - b.entryTime.getTime()
    );
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
      return [...prev, { tradeId, mode: 'simple', context: value }];
    });
  }, []);

  const handleStructuredContextChange = useCallback(
    (tradeId: string, field: keyof TradeContext, value: string) => {
      setContexts((prev) => {
        const existing = prev.find((c) => c.tradeId === tradeId);
        if (existing) {
          return prev.map((c) =>
            c.tradeId === tradeId ? { ...c, [field]: value } : c
          );
        }
        return [...prev, { tradeId, [field]: value } as TradeContext];
      });
    },
    []
  );

  const handleCopy = useCallback(() => {
    if (dailyTrades.length === 0) return;

    const markdown = generateDailyDigestMarkdown(
      dailyTrades,
      selectedDate,
      contexts,
      mode,
      timezone
    );
    Clipboard.setString(markdown);
    setCopied(true);
    showSnackbar('Copied to clipboard!', { duration: 3000 });
    setTimeout(() => setCopied(false), 3000);
  }, [dailyTrades, selectedDate, contexts, mode, timezone, showSnackbar]);

  const dateLabel = formatDate(selectedDate, timezone);

  return (
    <View style={styles.container}>
      <View style={[styles.header, !isDesktop && styles.headerMobile]}>
        <View
          style={[styles.headerLeft, isDesktop && styles.headerLeftDesktop]}
        >
          <IconButton icon="calendar" onPress={() => setShowDatePicker(true)} />
          <Text variant="bodySmall" style={styles.switchLabel}>
            Structured
          </Text>
          <Switch
            value={mode === 'structured'}
            onValueChange={(value) => setMode(value ? 'structured' : 'simple')}
          />
        </View>
        <Text
          variant="titleLarge"
          style={isDesktop ? styles.titleDesktop : styles.titleMobile}
        >
          {dateLabel}
        </Text>
        {isDesktop && <View style={styles.headerSpacer} />}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
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
                  context={contexts.find((c) => c.tradeId === trade.id)}
                  mode={mode}
                  onContextChange={handleContextChange}
                  onStructuredContextChange={handleStructuredContextChange}
                  timezone={timezone}
                />
              ))}
            </View>
          </EmptyState>
        </ResponsiveContainer>
      </ScrollView>

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

      <DatePickerDialog
        visible={showDatePicker}
        date={selectedDate}
        onConfirm={handleDateChange}
        onDismiss={() => setShowDatePicker(false)}
        label="Select date"
      />
    </View>
  );
}

function TradeDigestCard({
  trade,
  context,
  mode,
  onContextChange,
  onStructuredContextChange,
  timezone,
}: {
  trade: Trade;
  context: TradeContext | undefined;
  mode: 'simple' | 'structured';
  onContextChange: (tradeId: string, value: string) => void;
  onStructuredContextChange: (
    tradeId: string,
    field: keyof TradeContext,
    value: string
  ) => void;
  timezone?: string;
}) {
  const theme = useAppTheme();
  const styles = tradeCardStyles(theme);
  const isProfit = trade.pnl >= 0;
  const sideColor = isProfit ? theme.colors.profit : theme.colors.loss;
  const screenshot = generateScreenshotFilename(trade);
  const rMultiple =
    trade.riskAmount !== undefined &&
    trade.riskAmount > 0 &&
    trade.pnl !== undefined
      ? trade.pnl / trade.riskAmount
      : null;

  const simpleContext = context?.context || '';
  const setup = context?.setup || '';
  const trigger = context?.trigger || '';
  const support = context?.support || '';
  const target = context?.target || '';
  const setupCustom = context?.setupCustom || '';
  const supportCustom = context?.supportCustom || '';

  const handleContextTextChange = (text: string) => {
    onContextChange(trade.id, text);
  };

  const handleSetupChange = (value: string) => {
    onStructuredContextChange(trade.id, 'setup', value);
  };

  const handleTriggerChange = (text: string) => {
    onStructuredContextChange(trade.id, 'trigger', text);
  };

  const handleSupportChange = (value: string) => {
    onStructuredContextChange(trade.id, 'support', value);
  };

  const handleTargetChange = (text: string) => {
    onStructuredContextChange(trade.id, 'target', text);
  };

  const handleSetupCustomChange = (text: string) => {
    onStructuredContextChange(trade.id, 'setupCustom', text);
  };

  const handleSupportCustomChange = (text: string) => {
    onStructuredContextChange(trade.id, 'supportCustom', text);
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

        <View style={styles.screenshotRow}>
          <Text variant="bodySmall" style={styles.screenshotLabel}>
            Screenshot:
          </Text>
          <Text variant="bodySmall" style={styles.screenshotValue}>
            {screenshot}
          </Text>
        </View>

        <View style={styles.detailsGrid}>
          <DetailItem
            label="Time"
            value={trade.entryTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: timezone,
            })}
          />
          <DetailItem label="Qty" value={`${trade.quantity} shares`} />
          <DetailItem label="Entry" value={`$${trade.entryPrice.toFixed(2)}`} />
          <DetailItem label="Exit" value={`$${trade.exitPrice.toFixed(2)}`} />
          {trade.riskAmount !== undefined && trade.riskAmount > 0 && (
            <DetailItem
              label="Risk"
              value={`$${trade.riskAmount.toFixed(2)}`}
            />
          )}
          {rMultiple !== null && (
            <DetailItem
              label="R-Multiple"
              value={`${rMultiple >= 0 ? '+' : ''}${rMultiple.toFixed(2)}R`}
            />
          )}
        </View>

        <View style={styles.contextInputContainer}>
          {mode === 'simple' ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.contextInput}
                placeholder="Add quick context..."
                placeholderTextColor={theme.colors.textSecondary}
                value={simpleContext}
                onChangeText={handleContextTextChange}
                multiline
                maxLength={200}
                numberOfLines={1}
              />
              <Text variant="bodySmall" style={styles.contextHint}>
                {simpleContext.length}/200
              </Text>
            </View>
          ) : (
            <View style={styles.structuredContainer}>
              <ContextChipRow
                label="Setup"
                options={[
                  'Key Level Breakout',
                  'Pullback',
                  'Range Break',
                  'Reversal',
                  'Custom',
                ]}
                value={setup}
                onChange={handleSetupChange}
                customValue={setupCustom}
                onCustomChange={handleSetupCustomChange}
              />
              <ContextTextInput
                label="Trigger"
                value={trigger}
                onChangeText={handleTriggerChange}
                placeholder="e.g., First 1-min candle new high"
              />
              <ContextChipRow
                label="Support"
                options={[
                  'Trend',
                  'Range',
                  'Choppy',
                  'High Momentum',
                  'Custom',
                ]}
                value={support}
                onChange={handleSupportChange}
                customValue={supportCustom}
                onCustomChange={handleSupportCustomChange}
              />
              <ContextTextInput
                label="Target"
                value={target}
                onChangeText={handleTargetChange}
                placeholder="e.g., Previous high"
              />
              <View style={styles.sideRow}>
                <Text variant="bodySmall" style={styles.sideLabel}>
                  Side:
                </Text>
                <Text variant="bodySmall" style={styles.sideValue}>
                  {trade.side.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

function ContextChipRow({
  label,
  options,
  value,
  onChange,
  customValue,
  onCustomChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  customValue?: string;
  onCustomChange?: (text: string) => void;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.structuredField}>
      <Text variant="bodySmall" style={styles.contextFieldLabel}>
        {label}
      </Text>
      <View style={styles.chipRow}>
        {options.map((option) => (
          <Chip
            key={option}
            selected={value === option}
            onPress={() => onChange(value === option ? '' : option)}
            compact
          >
            {option}
          </Chip>
        ))}
      </View>
      {value === 'Custom' && onCustomChange && (
        <TextInput
          style={styles.customInput}
          placeholder={`Custom ${label.toLowerCase()}...`}
          placeholderTextColor={theme.colors.textSecondary}
          value={customValue || ''}
          onChangeText={onCustomChange}
          multiline
          numberOfLines={1}
        />
      )}
    </View>
  );
}

function ContextTextInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.structuredField}>
      <Text variant="bodySmall" style={styles.contextFieldLabel}>
        {label}
      </Text>
      <TextInput
        style={styles.customInput}
        placeholder={placeholder || ''}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={1}
      />
    </View>
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
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    contextFieldLabel: {
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    customInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      color: theme.colors.onSurface,
      fontSize: 14,
      marginTop: theme.spacing.xs,
    },
    structuredField: {
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerMobile: {
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    headerLeftDesktop: {
      width: 160,
    },
    titleDesktop: {
      flex: 1,
      textAlign: 'center',
    },
    titleMobile: {
      textAlign: 'right',
    },
    headerSpacer: {
      width: 160,
    },
    switchLabel: {
      color: theme.colors.textSecondary,
    },

    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
      minHeight: '100%',
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
    screenshotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    screenshotLabel: {
      color: theme.colors.textSecondary,
    },
    screenshotValue: {
      color: theme.colors.onSurface,
      fontWeight: '500',
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
    modeToggle: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    modeChip: {
      borderRadius: theme.borderRadius.sm,
    },
    structuredContainer: {
      marginTop: theme.spacing.sm,
    },
    sideRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    sideLabel: {
      color: theme.colors.textSecondary,
    },
    sideValue: {
      color: theme.colors.onSurface,
      fontWeight: '500',
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
