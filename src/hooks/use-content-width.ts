import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { NavigationMode, useNavigationMode } from './use-navigation-mode';
import { SIDEBAR_WIDTH } from '../components/desktop-sidebar';

const RESPONSIVE_MAX_WIDTH = 1200;

export function getContentWidth(
  windowWidth: number,
  mode: NavigationMode
): number {
  let contentWidth = windowWidth;

  if (mode === 'sidebar') {
    contentWidth -= SIDEBAR_WIDTH;
  }

  if (mode === 'sidebar' && contentWidth > RESPONSIVE_MAX_WIDTH) {
    contentWidth = RESPONSIVE_MAX_WIDTH;
  }

  return contentWidth;
}

export function useContentWidth(): number {
  const { width } = useWindowDimensions();
  const mode = useNavigationMode();

  return useMemo(() => getContentWidth(width, mode), [width, mode]);
}
