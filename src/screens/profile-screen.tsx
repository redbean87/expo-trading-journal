import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Avatar,
  List,
  Switch,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';

import { Button } from '../components/button';
import { ResponsiveContainer } from '../components/responsive-container';
import { TimezonePicker } from '../components/timezone-picker';
import { CustomColorsDialog } from './profile/custom-colors-dialog';
import { useAppTheme } from '../hooks/use-app-theme';
import { useAuth } from '../hooks/use-auth';
import { useCloudSettings } from '../hooks/use-settings';
import {
  useUpdateTheme,
  useUpdateDisplayName,
  useUpdateCustomTheme,
} from '../hooks/use-settings';
import { useClearAllTrades } from '../hooks/use-trades';
import { useCustomThemeStore } from '../store/custom-theme-store';
import { useProfileStore } from '../store/profile-store';
import { useThemeStore } from '../store/theme-store';
import { rgbaToHex } from '../utils/color-intensity';

import type { CustomColors } from '../types';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { settings } = useCloudSettings();
  const { themeMode } = useThemeStore();
  const { displayName, defaultRiskPercent, setDefaultRiskPercent } =
    useProfileStore();
  const { preset, customColors } = useCustomThemeStore();
  const updateTheme = useUpdateTheme();
  const updateDisplayName = useUpdateDisplayName();
  const updateCustomTheme = useUpdateCustomTheme();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [displayNameDialogVisible, setDisplayNameDialogVisible] =
    useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [customColorsDialogVisible, setCustomColorsDialogVisible] =
    useState(false);
  const [riskPctDialogVisible, setRiskPctDialogVisible] = useState(false);
  const [tempRiskPct, setTempRiskPct] = useState('');
  const clearAllTrades = useClearAllTrades();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleThemeToggle = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await updateTheme(newMode);
  };

  const handleClearAllTrades = async () => {
    setClearLoading(true);
    try {
      await clearAllTrades();
      setClearDialogVisible(false);
    } catch (error) {
      console.error('Failed to clear trades:', error);
    } finally {
      setClearLoading(false);
    }
  };

  const handleOpenDisplayNameDialog = () => {
    setTempDisplayName(displayName || '');
    setDisplayNameDialogVisible(true);
  };

  const handleSaveDisplayName = async () => {
    setSaveLoading(true);
    try {
      await updateDisplayName(tempDisplayName);
      setDisplayNameDialogVisible(false);
    } catch (error) {
      console.error('Failed to save display name:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelDisplayName = () => {
    setTempDisplayName(displayName || '');
    setDisplayNameDialogVisible(false);
  };

  const handleSaveCustomColors = async (colors: CustomColors) => {
    await updateCustomTheme('custom', colors);
    setCustomColorsDialogVisible(false);
  };

  const handleOpenRiskPctDialog = () => {
    setTempRiskPct(
      defaultRiskPercent != null ? String(defaultRiskPercent) : ''
    );
    setRiskPctDialogVisible(true);
  };

  const handleSaveRiskPct = async () => {
    const pct = parseFloat(tempRiskPct);
    await setDefaultRiskPercent(!isNaN(pct) && pct > 0 ? pct : null);
    setRiskPctDialogVisible(false);
  };

  const handleCancelRiskPct = () => {
    setRiskPctDialogVisible(false);
  };

  const handleResetColors = async () => {
    await updateCustomTheme('default', null);
    // Keep dialog open so user can continue editing after reset
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ResponsiveContainer>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content style={styles.userSection}>
              <Avatar.Icon size={64} icon="account" />
              <Text variant="titleMedium" style={styles.userText}>
                {settings?.email ?? 'Signed in'}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Appearance
              </Text>
            </Card.Content>
            <List.Item
              title="Dark Mode"
              description={themeMode === 'dark' ? 'On' : 'Off'}
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={handleThemeToggle}
                />
              )}
            />
            <TimezonePicker />
            <List.Item
              title="Journal Name"
              description={displayName || 'Trading Journal'}
              left={(props) => <List.Icon {...props} icon="book-edit" />}
              onPress={handleOpenDisplayNameDialog}
            />
            <List.Item
              title="Custom Colors"
              description={preset === 'custom' ? 'Customized' : 'Default'}
              left={(props) => <List.Icon {...props} icon="palette" />}
              onPress={() => setCustomColorsDialogVisible(true)}
            />
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Trading
              </Text>
            </Card.Content>
            <List.Item
              title="Default Risk %"
              description={
                defaultRiskPercent != null
                  ? `${defaultRiskPercent}%`
                  : 'Not set'
              }
              left={(props) => <List.Icon {...props} icon="percent" />}
              onPress={handleOpenRiskPctDialog}
            />
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Data Management
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={() => setClearDialogVisible(true)}
                icon="delete"
                textColor={theme.colors.error}
                style={[
                  styles.actionButton,
                  { borderColor: theme.colors.error },
                ]}
              >
                Remove All Trades
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Account
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={handleLogout}
                loading={logoutLoading}
                disabled={logoutLoading}
                icon="logout"
                textColor={theme.colors.error}
                style={[
                  styles.actionButton,
                  { borderColor: theme.colors.error },
                ]}
              >
                Sign Out
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </ResponsiveContainer>

      <Portal>
        <Dialog
          visible={clearDialogVisible}
          onDismiss={() => setClearDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Remove All Trades</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to remove all trades? This action cannot be
              undone and will permanently delete all your trade data.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleClearAllTrades}
              loading={clearLoading}
              disabled={clearLoading}
              textColor={theme.colors.error}
            >
              Remove All
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={displayNameDialogVisible}
          onDismiss={handleCancelDisplayName}
          style={styles.dialog}
        >
          <Dialog.Title>Journal Name</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Display Name"
              value={tempDisplayName}
              onChangeText={setTempDisplayName}
              maxLength={50}
              placeholder="Trading Journal"
              mode="outlined"
              autoFocus
            />
            <Text variant="bodySmall" style={styles.characterCount}>
              {tempDisplayName.length}/50 characters
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelDisplayName}>Cancel</Button>
            <Button
              onPress={handleSaveDisplayName}
              loading={saveLoading}
              disabled={saveLoading}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={riskPctDialogVisible}
          onDismiss={handleCancelRiskPct}
          style={styles.dialog}
        >
          <Dialog.Title>Default Risk %</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Risk % per trade"
              value={tempRiskPct}
              onChangeText={setTempRiskPct}
              keyboardType="decimal-pad"
              placeholder="e.g. 1"
              mode="outlined"
              autoFocus
            />
            <Text variant="bodySmall" style={styles.characterCount}>
              Pre-fills the risk % field when logging trades
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelRiskPct}>Cancel</Button>
            <Button onPress={handleSaveRiskPct}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        <CustomColorsDialog
          visible={customColorsDialogVisible}
          onDismiss={() => setCustomColorsDialogVisible(false)}
          initialColors={{
            primary: rgbaToHex(theme.colors.primary),
            profit: rgbaToHex(theme.colors.profit),
            loss: rgbaToHex(theme.colors.loss),
            selectedBackground:
              customColors?.selectedBackground ||
              rgbaToHex(theme.colors.primaryContainer),
            selectedText:
              customColors?.selectedText ||
              rgbaToHex(theme.colors.onPrimaryContainer),
          }}
          onSave={handleSaveCustomColors}
          onReset={handleResetColors}
        />
      </Portal>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    card: {
      marginBottom: theme.spacing.lg,
      maxWidth: 600,
      width: '100%',
    },
    userSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    userText: {
      marginTop: theme.spacing.md,
    },
    cardActions: {
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
    },
    actionButton: {
      minWidth: 150,
    },
    sectionTitle: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.primary,
    },
    dialog: {
      maxWidth: 600,
      alignSelf: 'center',
    },
    characterCount: {
      marginTop: theme.spacing.sm,
      color: theme.colors.outline,
    },
  });
