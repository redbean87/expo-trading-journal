jest.mock('react-native', () => ({
  useWindowDimensions: jest.fn(),
}));

jest.mock('../use-navigation-mode', () => ({
  useNavigationMode: jest.fn(),
}));

jest.mock('../../components/desktop-sidebar', () => ({
  SIDEBAR_WIDTH: 240,
}));

import { getContentWidth } from '../use-content-width';

describe('getContentWidth', () => {
  it('should return full width for tabs mode on mobile', () => {
    expect(getContentWidth(375, 'tabs')).toBe(375);
  });

  it('should return full width for tabs mode on tablet', () => {
    expect(getContentWidth(768, 'tabs')).toBe(768);
  });

  it('should subtract sidebar width for sidebar mode', () => {
    // 1024 - 240 (sidebar) = 784
    expect(getContentWidth(1024, 'sidebar')).toBe(784);
  });

  it('should subtract sidebar width for wider desktops', () => {
    // 1280 - 240 (sidebar) = 1040
    expect(getContentWidth(1280, 'sidebar')).toBe(1040);
  });

  it('should clamp to max width for very wide viewports', () => {
    // 1920 - 240 = 1680, but clamped to 1200
    expect(getContentWidth(1920, 'sidebar')).toBe(1200);
  });

  it('should clamp exactly at the boundary', () => {
    // 1440 - 240 = 1200 (exactly at max)
    expect(getContentWidth(1440, 'sidebar')).toBe(1200);
  });

  it('should not clamp for tabs mode on wide viewport', () => {
    // Tabs mode does not clamp, returns full width
    expect(getContentWidth(1920, 'tabs')).toBe(1920);
  });
});
