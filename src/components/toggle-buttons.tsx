import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Button } from './button';
import { useAppTheme } from '../hooks/use-app-theme';

export type ToggleButton = {
  value: string;
  label: string;
};

export type ToggleButtonsProps = {
  value: string;
  onValueChange: (value: string) => void;
  buttons: ToggleButton[];
};

export function ToggleButtons({
  value,
  onValueChange,
  buttons,
}: ToggleButtonsProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {buttons.map((button) => {
        const isActive = value === button.value;
        return (
          <Button
            key={button.value}
            mode={isActive ? 'contained' : 'outlined'}
            onPress={() => onValueChange(button.value)}
            style={[styles.button, isActive && styles.buttonActive]}
            labelStyle={
              isActive ? styles.buttonTextActive : styles.buttonTextInactive
            }
          >
            {button.label}
          </Button>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    button: {
      flex: 1,
      borderRadius: theme.spacing.sm,
    },
    buttonActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    buttonTextInactive: {
      color: theme.colors.textSecondary,
    },
    buttonTextActive: {
      color: theme.colors.onPrimaryContainer,
    },
  });
