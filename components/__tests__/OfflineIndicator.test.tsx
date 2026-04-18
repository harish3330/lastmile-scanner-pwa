import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OfflineIndicator } from '../OfflineIndicator';

// Mock the event bus
jest.mock('@/lib/events/eventBus', () => ({
  eventBus: {
    on: jest.fn((eventType, callback) => {
      return jest.fn();
    }),
  },
}));

jest.mock('@/lib/constants/syncEvents', () => ({
  SYNC_EVENTS: {
    SYNC_STARTED: 'SYNC_STARTED',
    SYNC_COMPLETED: 'SYNC_COMPLETED',
    SYNC_FAILED: 'SYNC_FAILED',
  },
}));

describe('OfflineIndicator Component', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
    jest.clearAllMocks();
  });

  it('should not render when online and not syncing', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    const { container } = render(<OfflineIndicator />);
    const banner = container.querySelector('div');
    expect(banner?.innerHTML).toBe('');
  });

  it('should render offline indicator when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    render(<OfflineIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/offline - using cached data/i)).toBeInTheDocument();
    });
  });

  it('should display correct icon when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    const { container } = render(<OfflineIndicator />);

    await waitFor(() => {
      const icon = container.querySelector('span');
      expect(icon?.textContent).toContain('🌐');
    });
  });

  it('should handle online event listener', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    render(<OfflineIndicator />);

    // Simulate online event
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
    fireEvent(window, new Event('online'));

    // Component should not render when online and not syncing
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
  });

  it('should handle offline event listener', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    const { rerender } = render(<OfflineIndicator />);

    // Simulate offline event
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });
    fireEvent(window, new Event('offline'));

    // Rerender to pick up state changes
    rerender(<OfflineIndicator />);

    waitFor(() => {
      expect(screen.getByText(/offline - using cached data/i)).toBeInTheDocument();
    });
  });

  it('should use fixed positioning', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    const { container } = render(<OfflineIndicator />);

    waitFor(() => {
      const bannerContainer = container.querySelector('div[style*="position"]');
      expect(bannerContainer).toHaveStyle('position: fixed');
    });
  });
});

function fireEvent(element: any, event: Event) {
  element.dispatchEvent(event);
}
