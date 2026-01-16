import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

type GoogleSignInButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'signIn' | 'signUp';
};

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  mode = 'signIn',
}: GoogleSignInButtonProps) {
  const label =
    mode === 'signIn' ? 'Sign in with Google' : 'Sign up with Google';

  return (
    <Button
      mode="outlined"
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={({ size, color }) => (
        <MaterialCommunityIcons name="google" size={size} color={color} />
      )}
      style={styles.button}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
  },
});
