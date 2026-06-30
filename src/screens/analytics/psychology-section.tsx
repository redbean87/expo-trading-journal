import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ConfidenceCard } from './confidence-card';
import { MistakesCard } from './mistakes-card';
import { TradeAgainCard } from './trade-again-card';
import { useAppTheme } from '../../hooks/use-app-theme';
import { Trade } from '../../types';

type PsychologySectionProps = {
  trades: Trade[];
};

export function PsychologySection({ trades }: PsychologySectionProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ConfidenceCard trades={trades} />
      <MistakesCard trades={trades} />
      <TradeAgainCard trades={trades} />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
  });
