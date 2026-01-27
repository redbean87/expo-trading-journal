jest.mock('@react-navigation/native', () => ({
  DefaultTheme: { colors: {} },
  DarkTheme: { colors: {} },
}));

jest.mock('react-native-paper', () => ({
  MD3LightTheme: { colors: {} },
  MD3DarkTheme: { colors: {} },
}));

import { spacing, layout } from '../index';

describe('spacing', () => {
  it('should define the complete spacing scale', () => {
    expect(spacing).toEqual({
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
    });
  });

  it('should have values that increase monotonically', () => {
    const values = Object.values(spacing);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe('layout', () => {
  it('should define breakpoints', () => {
    expect(layout.breakpoints).toEqual({
      tablet: 768,
      desktop: 1024,
    });
  });

  it('should define container constraints', () => {
    expect(layout.container).toEqual({
      maxWidth: 1200,
    });
  });

  it('should define grid defaults', () => {
    expect(layout.grid).toEqual({
      gap: 12,
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 4,
      },
    });
  });
});
