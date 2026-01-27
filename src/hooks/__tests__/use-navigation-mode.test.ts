jest.mock('../use-breakpoint', () => ({
  useBreakpoint: jest.fn(),
}));

import { getNavigationMode } from '../use-navigation-mode';

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
