import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

export type BreakpointResult = {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
};

export function useBreakpoint(): BreakpointResult {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    let breakpoint: Breakpoint;

    if (width >= BREAKPOINTS.desktop) {
      breakpoint = 'desktop';
    } else if (width >= BREAKPOINTS.tablet) {
      breakpoint = 'tablet';
    } else {
      breakpoint = 'mobile';
    }

    return {
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      width,
    };
  }, [width]);
}
