import { SegmentedButtons as PaperSegmentedButtons } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

import type { ComponentProps } from 'react';

export type SegmentedButtonsProps = ComponentProps<
  typeof PaperSegmentedButtons
>;

/**
 * Custom SegmentedButtons component that applies custom theme colors.
 * Wrapper around React Native Paper's SegmentedButtons.
 */
export function SegmentedButtons(props: SegmentedButtonsProps) {
  const theme = useAppTheme();

  return (
    <PaperSegmentedButtons
      {...props}
      theme={{
        colors: {
          secondaryContainer: theme.colors.tabSelectedBackground,
          onSecondaryContainer: theme.colors.tabSelectedText,
        },
      }}
    />
  );
}
