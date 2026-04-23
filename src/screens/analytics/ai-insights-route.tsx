import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Clipboard } from 'react-native';
import { Text, Switch, Card } from 'react-native-paper';

import { Button } from '../../components/button';
import { CardEmptyState } from '../../components/card-empty-state';
import { SectionCard } from '../../components/section-card';
import { SegmentedButtons } from '../../components/segmented-buttons';
import { useAIReport } from '../../hooks/use-ai-report';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useAnalyticsStore } from '../../store/analytics-store';
import { generateAIReport } from '../../utils/ai-export';
import { getDateRangeLabel } from '../../utils/date-range';
import {
  estimateTokens,
  formatTokenCount,
  checkTokenLimits,
} from '../../utils/token-counter';
import { useAnalyticsData } from '../analytics-layout';

export default function AIInsightsRoute() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { trades } = useAnalyticsData();
  const { selectedRange, customRangeStart, customRangeEnd } =
    useAnalyticsStore();

  const [tradeDateLimit, setTradeDateLimit] = useState<number>(30); // Default 30 days
  const [includeIndividualTrades, setIncludeIndividualTrades] =
    useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const periodLabel = useMemo(() => {
    if (selectedRange === 'custom' && customRangeStart && customRangeEnd) {
      return 'Custom Range';
    }
    return getDateRangeLabel(selectedRange);
  }, [selectedRange, customRangeStart, customRangeEnd]);

  const periodStart = useMemo(() => {
    if (selectedRange === 'custom' && customRangeStart) {
      return new Date(customRangeStart);
    }
    // Default to beginning of range or first trade
    return trades.length > 0
      ? new Date(Math.min(...trades.map((t) => t.exitTime.getTime())))
      : new Date();
  }, [selectedRange, customRangeStart, trades]);

  const periodEnd = useMemo(() => {
    if (selectedRange === 'custom' && customRangeEnd) {
      return new Date(customRangeEnd);
    }
    return new Date();
  }, [selectedRange, customRangeEnd]);

  const aiReport = useAIReport(trades, periodLabel, periodStart, periodEnd, {
    tradeDateLimit,
    includeIndividualTrades,
  });

  const reportText = useMemo(() => {
    if (!aiReport) return '';
    return generateAIReport(aiReport); // Always use this, no more generateFullAIReport
  }, [aiReport]);

  const tokenCount = useMemo(() => {
    return estimateTokens(reportText);
  }, [reportText]);

  const tokenLimits = useMemo(() => {
    return checkTokenLimits(tokenCount);
  }, [tokenCount]);

  const handleCopy = () => {
    if (!reportText) return;
    Clipboard.setString(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (trades.length === 0) {
    return (
      <CardEmptyState
        icon="robot"
        title="No trades to analyze"
        subtitle="Start trading to generate AI analysis"
      />
    );
  }

  if (!aiReport) {
    return (
      <CardEmptyState
        icon="loading"
        title="Loading analysis..."
        subtitle="Preparing your trading data"
      />
    );
  }

  const isTokenSafe = tokenLimits.claudeFree || tokenLimits.chatgpt4;

  return (
    <ScrollView style={styles.container}>
      <SectionCard title="AI Analysis Export">
        {/* Data Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Data Summary</Text>
          <Text style={styles.text}>
            Period: {periodLabel}
            {'\n'}
            Total Trades: {aiReport.statistics.totalTrades}
            {'\n'}
            Individual Trades: {aiReport.selectedTrades.length}
            {'\n'}
            Aggregated Analytics: Full period included{'\n'}
            Estimated Tokens: {formatTokenCount(tokenCount)}
          </Text>
        </View>

        {/* Token Warning */}
        {!isTokenSafe && (
          <Card
            style={[
              styles.warningCard,
              { backgroundColor: theme.colors.errorContainer },
            ]}
          >
            <Card.Content>
              <Text
                style={[styles.warningTitle, { color: theme.colors.error }]}
              >
                ⚠️ Token Limit Warning
              </Text>
              <Text
                style={[
                  styles.warningText,
                  { color: theme.colors.onErrorContainer },
                ]}
              >
                This report has {formatTokenCount(tokenCount)} tokens, which may
                exceed limits for:{'\n'}• Claude Free (25K){'\n'}• ChatGPT-4
                (8K){'\n\n'}
                Compatible with:{'\n'}• Claude Pro (200K) ✅{'\n'}• GPT-4 Turbo
                (128K) ✅
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Trade History Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Trade History Range</Text>
          <Text
            style={[
              styles.helperText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Select how many days of individual trade history to include
          </Text>
          <SegmentedButtons
            value={tradeDateLimit.toString()}
            onValueChange={(v) => setTradeDateLimit(parseInt(v))}
            buttons={[
              { value: '7', label: '7 days' },
              { value: '14', label: '14 days' },
              { value: '30', label: '30 days' },
              { value: '60', label: '60 days' },
              { value: '90', label: '90 days' },
            ]}
          />
        </View>

        {/* Include Individual Trades Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text
              style={[styles.toggleLabel, { color: theme.colors.onSurface }]}
            >
              Include Individual Trade History
            </Text>
            <Switch
              value={includeIndividualTrades}
              onValueChange={setIncludeIndividualTrades}
            />
          </View>
          <Text
            style={[
              styles.helperText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {includeIndividualTrades
              ? `Including ${aiReport.selectedTrades.length} trades from last ${tradeDateLimit} days`
              : 'Only aggregated statistics and patterns will be included'}
          </Text>
        </View>

        {/* Privacy Notice */}
        <Card
          style={[
            styles.privacyCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Card.Content>
            <Text
              style={[styles.privacyTitle, { color: theme.colors.onSurface }]}
            >
              ⚠️ Privacy Notice
            </Text>
            <Text
              style={[
                styles.privacyText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              This report contains sensitive trading data including P&L amounts,
              trade times, strategies, and personal notes.{'\n\n'}• Review
              before sharing with AI services{'\n'}• Use trusted services with
              clear privacy policies{'\n'}• Consider local LLMs (Ollama/LM
              Studio) for complete privacy{'\n'}• Never share publicly or in
              shared workspaces
            </Text>
          </Card.Content>
        </Card>

        {/* Preview Toggle */}
        <Button
          mode="outlined"
          onPress={() => setShowPreview(!showPreview)}
          style={styles.previewButton}
        >
          {showPreview ? 'Hide Preview' : 'View Preview'}
        </Button>

        {/* Preview Content */}
        {showPreview && reportText && (
          <Card style={styles.previewCard}>
            <Card.Content>
              <ScrollView style={styles.previewScroll} nestedScrollEnabled>
                <Text
                  style={[
                    styles.previewText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {reportText}
                </Text>
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Copy Button */}
        <Button
          mode="contained"
          onPress={handleCopy}
          style={styles.copyButton}
          icon={copied ? 'check' : 'content-copy'}
        >
          {copied ? 'Copied to Clipboard!' : 'Copy for AI Analysis'}
        </Button>
      </SectionCard>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    text: {
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8,
    },
    toggleLabel: {
      fontSize: 14,
    },
    helperText: {
      fontSize: 12,
      marginBottom: 12,
      marginLeft: 4,
    },
    warningCard: {
      marginBottom: 16,
    },
    warningTitle: {
      fontWeight: '600',
      fontSize: 14,
      marginBottom: 8,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 18,
    },
    privacyCard: {
      marginBottom: 16,
    },
    privacyTitle: {
      fontWeight: '600',
      fontSize: 14,
      marginBottom: 8,
    },
    privacyText: {
      fontSize: 13,
      lineHeight: 18,
    },
    previewButton: {
      marginBottom: 12,
    },
    previewCard: {
      marginBottom: 16,
      maxHeight: 400,
      backgroundColor: theme.colors.surface,
    },
    previewScroll: {
      maxHeight: 360,
    },
    previewText: {
      fontFamily: 'monospace',
      fontSize: 11,
      lineHeight: 14,
    },
    copyButton: {
      marginTop: 8,
    },
  });
