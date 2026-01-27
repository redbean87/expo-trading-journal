import { useMemo } from 'react';
import { type ViewStyle } from 'react-native';

import { type Breakpoint, useBreakpoint } from './use-breakpoint';

export type NavigationMode = 'tabs' | 'sidebar';

export function getNavigationMode(breakpoint: Breakpoint): NavigationMode {
  return breakpoint === 'desktop' ? 'sidebar' : 'tabs';
}

export function getTabBarStyle(
  isSidebar: boolean,
  surfaceColor: string,
  borderColor: string
): ViewStyle {
  if (isSidebar) {
    return { display: 'none' };
  }
  return {
    backgroundColor: surfaceColor,
    borderTopColor: borderColor,
  };
}

export function useNavigationMode(): NavigationMode {
  const { breakpoint } = useBreakpoint();

  return useMemo(() => getNavigationMode(breakpoint), [breakpoint]);
}
