import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockAddEventListener = jest.fn();
const mockFetch = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: (cb: (state: { isConnected: boolean }) => void) =>
    mockAddEventListener(cb),
  fetch: () => mockFetch(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { useNetworkStatus } from '../use-network-status';

describe('useNetworkStatus (native)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddEventListener.mockReturnValue(jest.fn());
  });

  it('returns true by default before NetInfo resolves', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(true);
  });

  it('updates when NetInfo reports offline', async () => {
    let listener: ((state: { isConnected: boolean }) => void) | undefined;
    mockAddEventListener.mockImplementation((cb) => {
      listener = cb;
      return jest.fn();
    });
    mockFetch.mockResolvedValue({ isConnected: true });

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      listener?.({ isConnected: false });
    });
    expect(result.current.isConnected).toBe(false);

    act(() => {
      listener?.({ isConnected: true });
    });
    expect(result.current.isConnected).toBe(true);
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = jest.fn();
    mockAddEventListener.mockReturnValue(unsubscribe);
    mockFetch.mockResolvedValue({ isConnected: true });

    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
