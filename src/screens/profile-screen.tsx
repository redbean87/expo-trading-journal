import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Switch,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';

import { ResponsiveContainer } from '../components/responsive-container';
import { TimezonePicker } from '../components/timezone-picker';
import { CustomColorsDialog } from './profile/custom-colors-dialog';
import { useAppTheme } from '../hooks/use-app-theme';
import { useAuth } from '../hooks/use-auth';
import { useUpdateTheme, useUpdateDisplayName } from '../hooks/use-settings';
import { useClearAllTrades } from '../hooks/use-trades';
import { useCustomThemeStore } from '../store/custom-theme-store';
import { useProfileStore } from '../store/profile-store';
import { useThemeStore } from '../store/theme-store';
import { rgbaToHex } from '../utils/color-intensity';

import type { CustomColors } from '../types';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { themeMode } = useThemeStore();
  const { displayName } = useProfileStore();
  const { preset, customColors } = useCustomThemeStore();
  const updateTheme = useUpdateTheme();
  const updateDisplayName = useUpdateDisplayName();
  const theme = useAppTheme();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [displayNameDialogVisible, setDisplayNameDialogVisible] =
    useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [customColorsDialogVisible, setCustomColorsDialogVisible] =
    useState(false);
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
    const { setCustomColors } = useCustomThemeStore.getState();
    await setCustomColors(colors);
    setCustomColorsDialogVisible(false);
  };

  const handleResetColors = async () => {
    const { resetToDefaults } = useCustomThemeStore.getState();
    await resetToDefaults();
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
                Signed in
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
            <Text
              variant="bodySmall"
              style={{ marginTop: 8, color: theme.colors.outline }}
            >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    maxWidth: 600,
    width: '100%',
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  userText: {
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  cardActions: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionButton: {
    minWidth: 150,
  },
});
