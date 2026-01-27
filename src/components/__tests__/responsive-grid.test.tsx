import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { Breakpoint } from '../../hooks/use-breakpoint';
import { ResponsiveGrid } from '../responsive-grid';

const mockBreakpointResult: {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
} = {
  breakpoint: 'mobile',
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  width: 375,
};

jest.mock('../../hooks/use-breakpoint', () => ({
  useBreakpoint: () => mockBreakpointResult,
}));

describe('ResponsiveGrid', () => {
  beforeEach(() => {
    mockBreakpointResult.breakpoint = 'mobile';
    mockBreakpointResult.isMobile = true;
    mockBreakpointResult.isTablet = false;
    mockBreakpointResult.isDesktop = false;
    mockBreakpointResult.width = 375;
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <ResponsiveGrid>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </ResponsiveGrid>
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('should use 1 column on mobile by default', () => {
    const { toJSON } = render(
      <ResponsiveGrid>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();

    // Check that child wrappers have 100% width (1 column)
    const container = tree as {
      children?: Array<{ props?: { style?: object } }>;
    };
    expect(container.children?.[0]?.props?.style).toEqual(
      expect.objectContaining({ width: '100%' })
    );
  });

  it('should use 2 columns on tablet by default', () => {
    mockBreakpointResult.breakpoint = 'tablet';
    mockBreakpointResult.isMobile = false;
    mockBreakpointResult.isTablet = true;
    mockBreakpointResult.isDesktop = false;
    mockBreakpointResult.width = 800;

    const { toJSON } = render(
      <ResponsiveGrid>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    const container = tree as {
      children?: Array<{ props?: { style?: object } }>;
    };
    expect(container.children?.[0]?.props?.style).toEqual(
      expect.objectContaining({ width: '50%' })
    );
  });

  it('should use 4 columns on desktop by default', () => {
    mockBreakpointResult.breakpoint = 'desktop';
    mockBreakpointResult.isMobile = false;
    mockBreakpointResult.isTablet = false;
    mockBreakpointResult.isDesktop = true;
    mockBreakpointResult.width = 1440;

    const { toJSON } = render(
      <ResponsiveGrid>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        <Text>Item 4</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    const container = tree as {
      children?: Array<{ props?: { style?: object } }>;
    };
    expect(container.children?.[0]?.props?.style).toEqual(
      expect.objectContaining({ width: '25%' })
    );
  });

  it('should use custom column configuration', () => {
    mockBreakpointResult.breakpoint = 'desktop';
    mockBreakpointResult.isMobile = false;
    mockBreakpointResult.isTablet = false;
    mockBreakpointResult.isDesktop = true;
    mockBreakpointResult.width = 1440;

    const { toJSON } = render(
      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    const container = tree as {
      children?: Array<{ props?: { style?: object } }>;
    };
    // 100 / 3 = 33.333...%
    expect(container.children?.[0]?.props?.style).toEqual(
      expect.objectContaining({ width: `${100 / 3}%` })
    );
  });

  it('should apply default gap of 12', () => {
    const { toJSON } = render(
      <ResponsiveGrid>
        <Text>Item 1</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(
      (tree as { props?: { style?: object[] } })?.props?.style
    ).toContainEqual(expect.objectContaining({ gap: 12 }));
  });

  it('should apply custom gap', () => {
    const { toJSON } = render(
      <ResponsiveGrid gap={24}>
        <Text>Item 1</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(
      (tree as { props?: { style?: object[] } })?.props?.style
    ).toContainEqual(expect.objectContaining({ gap: 24 }));
  });

  it('should merge additional style prop', () => {
    const { toJSON } = render(
      <ResponsiveGrid style={{ backgroundColor: 'red', padding: 20 }}>
        <Text>Item 1</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(
      (tree as { props?: { style?: object[] } })?.props?.style
    ).toContainEqual(
      expect.objectContaining({ backgroundColor: 'red', padding: 20 })
    );
  });

  it('should fall back to default column count for missing breakpoint config', () => {
    mockBreakpointResult.breakpoint = 'tablet';
    mockBreakpointResult.isMobile = false;
    mockBreakpointResult.isTablet = true;
    mockBreakpointResult.isDesktop = false;
    mockBreakpointResult.width = 800;

    // Only specifying mobile and desktop, tablet should fall back to default (2)
    const { toJSON } = render(
      <ResponsiveGrid columns={{ mobile: 1, desktop: 4 }}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </ResponsiveGrid>
    );

    const tree = toJSON();
    const container = tree as {
      children?: Array<{ props?: { style?: object } }>;
    };
    expect(container.children?.[0]?.props?.style).toEqual(
      expect.objectContaining({ width: '50%' })
    );
  });
});
