import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from '../../pages/_app';

// Mock the service worker manager
jest.mock('@/lib/serviceWorker/registration', () => ({
  serviceWorkerManager: {
    register: jest.fn(),
  },
}));

// Mock the background sync manager
jest.mock('@/lib/serviceWorker/backgroundSync', () => ({
  backgroundSyncManager: {
    registerBackgroundSync: jest.fn(),
    triggerSync: jest.fn(),
  },
}));

// Mock the event bus
jest.mock('@/lib/events/eventBus', () => ({
  eventBus: {
    emit: jest.fn(),
  },
}));

// Mock the OfflineIndicator component
jest.mock('@/components/OfflineIndicator', () => ({
  OfflineIndicator: () => <div data-testid="offline-indicator">Offline Indicator</div>,
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('App Component', () => {
  let MockComponent: React.FC<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    MockComponent = ({ testProp }: any) => <div>Mock Component - {testProp}</div>;
  });

  const mockRouter = {
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    reload: jest.fn(),
  };

  it('should render the OfflineIndicator', () => {
    const { getByTestId } = render(
      <App Component={MockComponent} pageProps={{ testProp: 'test' }} router={mockRouter as any} />
    );
    expect(getByTestId('offline-indicator')).toBeInTheDocument();
  });

  it('should render the page component', () => {
    const { getByText } = render(
      <App Component={MockComponent} pageProps={{ testProp: 'value' }} router={mockRouter as any} />
    );
    expect(getByText('Mock Component - value')).toBeInTheDocument();
  });

  it('should initialize service worker on mount', async () => {
    const { serviceWorkerManager } = require('@/lib/serviceWorker/registration');

    render(<App Component={MockComponent} pageProps={{}} router={mockRouter as any} />);

    await waitFor(() => {
      expect(serviceWorkerManager.register).toHaveBeenCalled();
    });
  });

  it('should register background sync on mount', async () => {
    const { backgroundSyncManager } = require('@/lib/serviceWorker/backgroundSync');

    render(<App Component={MockComponent} pageProps={{}} router={mockRouter as any} />);

    await waitFor(() => {
      expect(backgroundSyncManager.registerBackgroundSync).toHaveBeenCalled();
    });
  });

  it('should listen to online events', async () => {
    const { backgroundSyncManager } = require('@/lib/serviceWorker/backgroundSync');

    render(<App Component={MockComponent} pageProps={{}} router={mockRouter as any} />);

    // Simulate online event
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(backgroundSyncManager.triggerSync).toHaveBeenCalled();
    });
  });

  it('should emit event on offline', () => {
    const { eventBus } = require('@/lib/events/eventBus');

    render(<App Component={MockComponent} pageProps={{}} router={mockRouter as any} />);

    fireEvent(window, new Event('offline'));

    expect(eventBus.emit).toHaveBeenCalled();
  });

  it('should handle network status changes', async () => {
    const { eventBus } = require('@/lib/events/eventBus');

    render(<App Component={MockComponent} pageProps={{}} router={mockRouter as any} />);

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(eventBus.emit).toHaveBeenCalled();
    });
  });
});

// Helper function
function fireEvent(element: any, event: Event) {
  element.dispatchEvent(event);
}
