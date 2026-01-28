import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { DesktopSidebar } from '../desktop-sidebar';

let mockPathname = '/';
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('../../hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      surface: '#ffffff',
      border: '#e0e0e0',
      primary: '#6200ee',
      primaryContainer: '#e8def8',
      textSecondary: '#757575',
    },
  }),
}));

describe('DesktopSidebar', () => {
  beforeEach(() => {
    mockPathname = '/';
    mockReplace.mockClear();
  });

  it('should render all navigation items', () => {
    const { getByText } = render(<DesktopSidebar />);

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Trades')).toBeTruthy();
    expect(getByText('Analytics')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('should mark Home as active for root pathname', () => {
    mockPathname = '/';
    const { getByLabelText } = render(<DesktopSidebar />);

    const homeItem = getByLabelText('Home');
    expect(homeItem.props.accessibilityState).toEqual({ selected: true });
  });

  it('should mark Trades as active for trades pathname', () => {
    mockPathname = '/(tabs)/trades';
    const { getByLabelText } = render(<DesktopSidebar />);

    const tradesItem = getByLabelText('Trades');
    expect(tradesItem.props.accessibilityState).toEqual({ selected: true });

    const homeItem = getByLabelText('Home');
    expect(homeItem.props.accessibilityState).toEqual({ selected: false });
  });

  it('should mark Analytics as active for analytics pathname', () => {
    mockPathname = '/(tabs)/analytics';
    const { getByLabelText } = render(<DesktopSidebar />);

    const analyticsItem = getByLabelText('Analytics');
    expect(analyticsItem.props.accessibilityState).toEqual({ selected: true });
  });

  it('should mark Profile as active for profile pathname', () => {
    mockPathname = '/(tabs)/profile';
    const { getByLabelText } = render(<DesktopSidebar />);

    const profileItem = getByLabelText('Profile');
    expect(profileItem.props.accessibilityState).toEqual({ selected: true });
  });

  it('should mark Trades as active for trade detail pathname', () => {
    mockPathname = '/trade/abc123';
    const { getByLabelText } = render(<DesktopSidebar />);

    const tradesItem = getByLabelText('Trades');
    expect(tradesItem.props.accessibilityState).toEqual({ selected: true });

    const homeItem = getByLabelText('Home');
    expect(homeItem.props.accessibilityState).toEqual({ selected: false });
  });

  it('should mark Trades as active for add-trade pathname', () => {
    mockPathname = '/add-trade';
    const { getByLabelText } = render(<DesktopSidebar />);

    const tradesItem = getByLabelText('Trades');
    expect(tradesItem.props.accessibilityState).toEqual({ selected: true });
  });

  it('should mark Trades as active for edit-trade pathname', () => {
    mockPathname = '/edit-trade/abc123';
    const { getByLabelText } = render(<DesktopSidebar />);

    const tradesItem = getByLabelText('Trades');
    expect(tradesItem.props.accessibilityState).toEqual({ selected: true });
  });

  it('should navigate to correct route on press', () => {
    const { getByLabelText } = render(<DesktopSidebar />);

    fireEvent.press(getByLabelText('Trades'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/trades');

    fireEvent.press(getByLabelText('Analytics'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/analytics');

    fireEvent.press(getByLabelText('Profile'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/profile');

    fireEvent.press(getByLabelText('Home'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
