'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useBreakpoint = useBreakpoint;
const react_1 = require('react');
const react_native_1 = require('react-native');
const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};
function useBreakpoint() {
  const { width } = (0, react_native_1.useWindowDimensions)();
  return (0, react_1.useMemo)(() => {
    let breakpoint;
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
