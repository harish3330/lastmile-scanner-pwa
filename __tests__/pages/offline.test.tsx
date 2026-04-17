import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OfflinePageComponent from '../../pages/offline';

describe('Offline Page Component', () => {
  beforeEach(() => {
    // Reset navigator.onLine before each test
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  it('should render the offline page component', () => {
    render(<OfflinePageComponent />);
    const container = screen.getByRole('heading', { name: /back online/i });
    expect(container).toBeInTheDocument();
  });

  it('should display offline message when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    render(<OfflinePageComponent />);
    const title = screen.getByRole('heading', { name: /you are offline/i });
    expect(title).toBeInTheDocument();
  });

  it('should display online message when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    render(<OfflinePageComponent />);
    const title = screen.getByRole('heading', { name: /back online/i });
    expect(title).toBeInTheDocument();
  });

  it('should show reload button when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    render(<OfflinePageComponent />);
    const reloadButton = screen.getByRole('button', { name: /reload page/i });
    expect(reloadButton).toBeInTheDocument();
  });

  it('should show go back button when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    render(<OfflinePageComponent />);
    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should update status when online event is fired', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    render(<OfflinePageComponent />);
    let title = screen.getByRole('heading', { name: /you are offline/i });
    expect(title).toBeInTheDocument();

    // Simulate online event
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
    fireEvent(window, new Event('online'));

    title = screen.getByRole('heading', { name: /back online/i });
    expect(title).toBeInTheDocument();
  });

  it('should display offline mode information', () => {
    render(<OfflinePageComponent />);
    const infoText = screen.getByText(/offline mode enabled/i);
    expect(infoText).toBeInTheDocument();
  });

  it('should display sync information', () => {
    render(<OfflinePageComponent />);
    const syncText = screen.getByText(/pending operations will be synchronized/i);
    expect(syncText).toBeInTheDocument();
  });
});
