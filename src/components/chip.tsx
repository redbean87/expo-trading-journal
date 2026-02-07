import { Chip as PaperChip } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

import type { ComponentProps } from 'react';

export type ChipProps = ComponentProps<typeof PaperChip>;

/**
 * Custom Chip component that applies custom theme colors.
 * Wrapper around React Native Paper's Chip.
 */
export function Chip(props: ChipProps) {
  const theme = useAppTheme();

  return (
    <PaperChip
      {...props}
      theme={{
        colors: {
          secondaryContainer: theme.colors.chipSelectedBackground,
          onSecondaryContainer: theme.colors.chipSelectedText,
        },
      }}
    />
  );
}
