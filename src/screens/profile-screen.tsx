import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, List, Switch } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useAuth } from '../hooks/use-auth';
import { useThemeStore } from '../store/theme-store';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { themeMode, toggleTheme } = useThemeStore();
  const theme = useAppTheme();
  const [logoutLoading, setLogoutLoading] = useState(false);

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

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account
            </Text>
          </Card.Content>
          <Card.Actions style={styles.logoutActions}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              loading={logoutLoading}
              disabled={logoutLoading}
              icon="logout"
              textColor={theme.colors.error}
              style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            >
              Sign Out
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
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
  logoutActions: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutButton: {
    minWidth: 150,
  },
});
