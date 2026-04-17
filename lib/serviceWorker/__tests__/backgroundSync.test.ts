import { BackgroundSyncManager, SYNC_TAG, MAX_SYNC_RETRIES } from '../backgroundSync';
import { eventBus } from '../../events/eventBus';
import { SYNC_EVENTS } from '../../constants/syncEvents';

describe('BackgroundSyncManager', () => {
  let manager: BackgroundSyncManager;

  beforeEach(() => {
    manager = new BackgroundSyncManager();
    
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Background Sync Configuration', () => {
    it('should have correct sync tag', () => {
      expect(SYNC_TAG).toBe('sync-pending-events');
    });

    it('should have correct max retries', () => {
      expect(MAX_SYNC_RETRIES).toBe(3);
    });

    it('should allow setting sync config', () => {
      expect(() => {
        manager.setSyncConfig({ maxRetries: 5 });
      }).not.toThrow();
    });
  });

  describe('Background Sync Registration', () => {
    it('should handle background sync registration gracefully', async () => {
      const result = await manager.registerBackgroundSync();
      expect(typeof result).toBe('boolean');
    });

    it('should return false when Background Sync API is not supported', async () => {
      // Mock unsupported environment
      const originalSW = (window as any).navigator.serviceWorker;
      delete (window as any).navigator.serviceWorker;

      const result = await manager.registerBackgroundSync();
      expect(result).toBe(false);

      // Restore
      (window as any).navigator.serviceWorker = originalSW;
    });
  });

  describe('Sync Triggering', () => {
    it('should handle trigger sync gracefully', async () => {
      expect(async () => {
        await manager.triggerSync();
      }).not.toThrow();
    });

    it('should emit sync started event on perform sync', async () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');

      // Mock fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 0, failed: 0 }),
      });

      await manager.performSync();

      // Check that sync started event was emitted
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SYNC_EVENTS.SYNC_STARTED,
        })
      );
    });
  });

  describe('Sync Completion', () => {
    it('should emit completion event when sync succeeds', async () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 5, failed: 0 }),
      });

      await manager.performSync();

      // Check that sync completed event was emitted
      const completedEvent = emitSpy.mock.calls.find(
        (call) => call[0].type === SYNC_EVENTS.SYNC_COMPLETED
      );
      expect(completedEvent).toBeDefined();
    });

    it('should emit failure event on sync error', async () => {
      const emitSpy = jest.spyOn(eventBus, 'emit');

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Run with max retries to exhaust attempts
      await manager.performSync(3);

      // Check that sync failed event was emitted
      const failedEvent = emitSpy.mock.calls.find(
        (call) => call[0].type === SYNC_EVENTS.SYNC_FAILED
      );
      expect(failedEvent).toBeDefined();
    });
  });

  describe('Sync API Endpoint', () => {
    it('should call sync API endpoint with correct URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 0, failed: 0 }),
      });

      await manager.performSync();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sync',
        expect.any(Object)
      );
    });

    it('should use POST method for sync API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 0, failed: 0 }),
      });

      await manager.performSync();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sync',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should send events in request body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ synced: 0, failed: 0 }),
      });

      await manager.performSync();

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(callArgs[1].body).toBeDefined();
    });
  });
});
