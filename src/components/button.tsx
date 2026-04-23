import { Button as PaperButton } from 'react-native-paper';

import type { ComponentProps } from 'react';

export type ButtonProps = ComponentProps<typeof PaperButton>;

/**
 * Custom Button component wrapper around React Native Paper's Button.
 * Provides a single point of control for button behavior and styling,
 * making it easier to customize or switch underlying implementations.
 */
export function Button(props: ButtonProps) {
  return <PaperButton {...props} />;
}
