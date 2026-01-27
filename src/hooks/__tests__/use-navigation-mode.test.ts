jest.mock('../use-breakpoint', () => ({
  useBreakpoint: jest.fn(),
}));

import { getNavigationMode, getTabBarStyle } from '../use-navigation-mode';

describe('getNavigationMode', () => {
  it('should return tabs for mobile breakpoint', () => {
    expect(getNavigationMode('mobile')).toBe('tabs');
  });

  it('should return tabs for tablet breakpoint', () => {
    expect(getNavigationMode('tablet')).toBe('tabs');
  });

  it('should return sidebar for desktop breakpoint', () => {
    expect(getNavigationMode('desktop')).toBe('sidebar');
  });
});

describe('getTabBarStyle', () => {
  it('should return display none for sidebar mode', () => {
    expect(getTabBarStyle(true, '#ffffff', '#e0e0e0')).toEqual({
      display: 'none',
    });
  });

  it('should return themed styles for tabs mode', () => {
    expect(getTabBarStyle(false, '#ffffff', '#e0e0e0')).toEqual({
      backgroundColor: '#ffffff',
      borderTopColor: '#e0e0e0',
    });
  });
});
