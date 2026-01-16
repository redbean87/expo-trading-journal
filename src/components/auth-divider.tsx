import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

export function AuthDivider() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Divider style={styles.divider} />
      <Text
        variant="bodySmall"
        style={[styles.text, { color: theme.colors.textSecondary }]}
      >
        OR
      </Text>
      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
  },
  text: {
    marginHorizontal: 16,
  },
});
