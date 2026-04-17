import { ServiceWorkerManager } from '../registration';

describe('ServiceWorkerManager', () => {
  let manager: ServiceWorkerManager;

  beforeEach(() => {
    manager = new ServiceWorkerManager();
    
    // Mock navigator.serviceWorker if not available
    if (!navigator.serviceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: jest.fn(),
          ready: Promise.resolve({}),
          addEventListener: jest.fn(),
          controller: null,
        },
        writable: true,
      });
    }
  });

  describe('Registration', () => {
    it('should check if service workers are supported', () => {
      const isSupported = 'serviceWorker' in navigator;
      expect(isSupported).toBeDefined();
    });

    it('should create manager instance', () => {
      expect(manager).toBeDefined();
      expect(manager.isActive()).toBe(false);
    });

    it('should get registration', () => {
      const registration = manager.getRegistration();
      expect(registration).toBeNull(); // Not registered yet
    });
  });

  describe('Message Posting', () => {
    it('should handle postMessage gracefully when no controller exists', () => {
      expect(() => {
        manager.postMessage({ type: 'TEST' });
      }).not.toThrow();
    });
  });

  describe('Unregister', () => {
    it('should handle unregister when not registered', async () => {
      const result = await manager.unregister();
      expect(result).toBe(false);
    });
  });

  describe('Check for Updates', () => {
    it('should handle update check when not registered', async () => {
      const hasUpdates = await manager.checkForUpdates();
      expect(hasUpdates).toBe(false);
    });
  });

  describe('Skip Waiting', () => {
    it('should handle skip waiting when not registered', async () => {
      expect(() => {
        manager.skipWaiting();
      }).not.toThrow();
    });
  });
});
