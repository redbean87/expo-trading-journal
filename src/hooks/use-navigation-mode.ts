import { useMemo } from 'react';

import { type Breakpoint, useBreakpoint } from './use-breakpoint';

export type NavigationMode = 'tabs' | 'sidebar';

export function getNavigationMode(breakpoint: Breakpoint): NavigationMode {
  return breakpoint === 'desktop' ? 'sidebar' : 'tabs';
}

export function useNavigationMode(): NavigationMode {
  const { breakpoint } = useBreakpoint();

  return useMemo(() => getNavigationMode(breakpoint), [breakpoint]);
}
