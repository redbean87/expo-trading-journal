import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { Breakpoint } from '../../hooks/use-breakpoint';
import { ResponsiveContainer } from '../responsive-container';

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

describe('ResponsiveContainer', () => {
  beforeEach(() => {
    mockBreakpointResult.breakpoint = 'mobile';
    mockBreakpointResult.isMobile = true;
    mockBreakpointResult.isTablet = false;
    mockBreakpointResult.isDesktop = false;
    mockBreakpointResult.width = 375;
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <ResponsiveContainer>
        <Text>Test Content</Text>
      </ResponsiveContainer>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should not apply maxWidth on mobile', () => {
    const { toJSON } = render(
      <ResponsiveContainer>
        <Text>Mobile Content</Text>
      </ResponsiveContainer>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    // On mobile, the container should not have maxWidth in its style
    expect(tree?.props?.style).not.toContainEqual(
      expect.objectContaining({ maxWidth: expect.any(Number) })
    );
  });

  it('should not apply maxWidth on tablet', () => {
    mockBreakpointResult.breakpoint = 'tablet';
    mockBreakpointResult.isMobile = false;
    mockBreakpointResult.isTablet = true;
    mockBreakpointResult.isDesktop = false;
    mockBreakpointResult.width = 800;

    const { toJSON } = render(
      <ResponsiveContainer>
        <Text>Tablet Content</Text>
      </ResponsiveContainer>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(tree?.props?.style).not.toContainEqual(
      expect.objectContaining({ maxWidth: expect.any(Number) })
    );
  });

  it('should apply default maxWidth (1200) on desktop', () => {
    mockBreakpointResult.breakpoint = 'desktop';
    mockBreakpointResult.isMobile = false;
    mockBreakpointResult.isTablet = false;
    mockBreakpointResult.isDesktop = true;
    mockBreakpointResult.width = 1440;

    const { toJSON } = render(
      <ResponsiveContainer>
        <Text>Desktop Content</Text>
      </ResponsiveContainer>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(tree?.props?.style).toContainEqual(
      expect.objectContaining({ maxWidth: 1200 })
    );
  });

  it('should use custom maxWidth when provided on desktop', () => {
    mockBreakpointResult.breakpoint = 'desktop';
    mockBreakpointResult.isMobile = false;
    mockBreakpointResult.isTablet = false;
    mockBreakpointResult.isDesktop = true;
    mockBreakpointResult.width = 1440;

    const { toJSON } = render(
      <ResponsiveContainer maxWidth={600}>
        <Text>Form Content</Text>
      </ResponsiveContainer>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(tree?.props?.style).toContainEqual(
      expect.objectContaining({ maxWidth: 600 })
    );
  });

  it('should merge additional style prop', () => {
    const { toJSON } = render(
      <ResponsiveContainer style={{ backgroundColor: 'red', padding: 20 }}>
        <Text>Styled Content</Text>
      </ResponsiveContainer>
    );

    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(tree?.props?.style).toContainEqual(
      expect.objectContaining({ backgroundColor: 'red', padding: 20 })
    );
  });
});
