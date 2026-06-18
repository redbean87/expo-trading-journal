/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react-native';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import { useNetworkStatus } from '../use-network-status';

describe('useNetworkStatus (web)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });
  });

  it('reflects navigator.onLine', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(false);
  });

  it('updates on online/offline events', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(true);

    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isConnected).toBe(false);

    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isConnected).toBe(true);
  });
});
