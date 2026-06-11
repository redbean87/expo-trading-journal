'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getNavigationMode = getNavigationMode;
exports.getTabBarStyle = getTabBarStyle;
exports.useNavigationMode = useNavigationMode;
const react_1 = require('react');
const use_breakpoint_1 = require('./use-breakpoint');
function getNavigationMode(breakpoint) {
  return breakpoint === 'desktop' ? 'sidebar' : 'tabs';
}
function getTabBarStyle(isSidebar, surfaceColor, borderColor) {
  if (isSidebar) {
    return { display: 'none' };
  }
  return {
    backgroundColor: surfaceColor,
    borderTopColor: borderColor,
  };
}
function useNavigationMode() {
  const { breakpoint } = (0, use_breakpoint_1.useBreakpoint)();
  return (0, react_1.useMemo)(
    () => getNavigationMode(breakpoint),
    [breakpoint]
  );
}
