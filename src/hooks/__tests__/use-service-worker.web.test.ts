/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { usePwaUpdateStore } from '@/store/pwa-update-store';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

const mockPostMessage = jest.fn();
const mockRegister = jest.fn();
const mockUpdate = jest.fn();
const mockFetch = jest.fn();
const mockController = {} as ServiceWorker;

function createServiceWorker(state: ServiceWorkerState = 'installing') {
  const listeners = new Map<string, EventListenerOrEventListenerObject>();
  const sw = {
    state,
    postMessage: mockPostMessage,
    addEventListener: jest.fn(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        listeners.set(event, handler);
      }
    ),
    dispatchEvent: (event: Event) => {
      const handler = listeners.get(event.type);
      if (typeof handler === 'function') {
        handler(event);
      } else if (handler && 'handleEvent' in handler) {
        handler.handleEvent(event);
      }
    },
  } as unknown as ServiceWorker;
  return sw;
}

function createRegistration() {
  mockUpdate.mockResolvedValue(undefined);
  const listeners = new Map<string, EventListenerOrEventListenerObject>();
  const registration = {
    installing: createServiceWorker(),
    waiting: createServiceWorker(),
    update: mockUpdate,
    addEventListener: jest.fn(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        listeners.set(event, handler);
      }
    ),
    dispatchEvent: (event: Event) => {
      const handler = listeners.get(event.type);
      if (typeof handler === 'function') {
        handler(event);
      } else if (handler && 'handleEvent' in handler) {
        handler.handleEvent(event);
      }
    },
  } as unknown as ServiceWorkerRegistration;
  return { registration, listeners };
}

describe('useServiceWorker (web)', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalNavigator = global.navigator;
  const originalLocation = global.location;
  const controllerListeners = new Map<
    string,
    EventListenerOrEventListenerObject
  >();

  beforeEach(() => {
    jest.clearAllMocks();
    usePwaUpdateStore.setState({ updateAvailable: false });
    process.env.NODE_ENV = 'production';

    controllerListeners.clear();
    Object.defineProperty(global, 'fetch', {
      value: mockFetch,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: {
          controller: mockController,
          register: mockRegister,
          ready: Promise.resolve({} as ServiceWorkerRegistration),
          addEventListener: jest.fn(
            (event: string, handler: EventListenerOrEventListenerObject) => {
              controllerListeners.set(event, handler);
            }
          ),
          removeEventListener: jest.fn((event: string) => {
            controllerListeners.delete(event);
          }),
          dispatchEvent: (event: Event) => {
            const handler = controllerListeners.get(event.type);
            if (typeof handler === 'function') {
              handler(event);
            } else if (handler && 'handleEvent' in handler) {
              handler.handleEvent(event);
            }
          },
        },
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'location', {
      value: { reload: jest.fn() },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('registers the service worker on web in production', async () => {
    const { registration } = createRegistration();
    (registration as unknown as Record<string, unknown>).installing = null;
    mockRegister.mockResolvedValue(registration);

    const { useServiceWorker } = await import('../use-service-worker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('/sw.js');
    });
  });

  it('sets updateAvailable when a new service worker is installed and waiting', async () => {
    const { registration } = createRegistration();
    (registration as unknown as Record<string, unknown>).waiting = null;
    mockRegister.mockResolvedValue(registration);

    const { useServiceWorker } = await import('../use-service-worker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });

    const installing = registration.installing as unknown as Record<
      string,
      unknown
    > & {
      dispatchEvent: (event: Event) => void;
    };

    act(() => {
      installing.state = 'installed';
      installing.dispatchEvent(new Event('statechange'));
    });

    expect(usePwaUpdateStore.getState().updateAvailable).toBe(true);
  });

  it('sets updateAvailable when registration already has a waiting worker', async () => {
    const { registration } = createRegistration();
    mockRegister.mockResolvedValue(registration);

    const { useServiceWorker } = await import('../use-service-worker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(usePwaUpdateStore.getState().updateAvailable).toBe(true);
    });
  });

  it('reloads the page when the service worker takes control', async () => {
    const { registration } = createRegistration();
    (registration as unknown as Record<string, unknown>).installing = null;
    mockRegister.mockResolvedValue(registration);

    const { useServiceWorker } = await import('../use-service-worker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });

    act(() => {
      global.navigator.serviceWorker.dispatchEvent(
        new Event('controllerchange')
      );
    });

    expect(global.location.reload).toHaveBeenCalled();
  });

  it('establishes the running version from version.json on mount', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        version: 'abc123',
        buildTime: '2026-07-01T00:00:00Z',
      }),
    });
    const { registration } = createRegistration();
    (registration as unknown as Record<string, unknown>).installing = null;
    (registration as unknown as Record<string, unknown>).waiting = null;
    mockRegister.mockResolvedValue(registration);

    const { useServiceWorker } = await import('../use-service-worker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const fetchCall = mockFetch.mock.calls[0] as [string];
    expect(fetchCall[0]).toContain('/version.json?');
    expect(usePwaUpdateStore.getState().updateAvailable).toBe(false);
  });

  it('sets updateAvailable when version.json returns a different version', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: 'abc123',
          buildTime: '2026-07-01T00:00:00Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: 'def456',
          buildTime: '2026-07-01T00:01:00Z',
        }),
      });
    const { registration } = createRegistration();
    (registration as unknown as Record<string, unknown>).installing = null;
    (registration as unknown as Record<string, unknown>).waiting = null;
    mockRegister.mockResolvedValue(registration);

    const { useServiceWorker } = await import('../use-service-worker');
    const { unmount } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(usePwaUpdateStore.getState().updateAvailable).toBe(false);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        version: 'def456',
        buildTime: '2026-07-01T00:01:00Z',
      }),
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => {
      expect(usePwaUpdateStore.getState().updateAvailable).toBe(true);
    });

    unmount();
  });
});
