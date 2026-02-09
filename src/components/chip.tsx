import { Chip as PaperChip } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

import type { ComponentProps } from 'react';

export type ChipProps = ComponentProps<typeof PaperChip>;

/**
 * Custom Chip component that applies custom theme colors.
 * Selectable chips (selected prop passed) switch between flat/outlined modes
 * to match segmented button styling. Tag chips (no selected prop) keep flat mode.
 */
export function Chip({
  selected,
  showSelectedCheck,
  mode,
  style,
  ...props
}: ChipProps) {
  const theme = useAppTheme();
  const isSelectable = selected !== undefined;

  return (
    <PaperChip
      {...props}
      style={[
        isSelectable && !selected && { backgroundColor: 'transparent' },
        style,
      ]}
      selected={selected}
      showSelectedCheck={isSelectable ? false : showSelectedCheck}
      mode={isSelectable ? (selected ? 'flat' : 'outlined') : mode}
      theme={{
        colors: {
          secondaryContainer: theme.colors.chipSelectedBackground,
          onSecondaryContainer: theme.colors.chipSelectedText,
        },
      }}
    />
  );
}
