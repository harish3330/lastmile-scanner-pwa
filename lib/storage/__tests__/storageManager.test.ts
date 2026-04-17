import { StorageManager } from '../storageManager';
import type { SyncEvent } from '../../types/serviceWorker';

describe('StorageManager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    storageManager = new StorageManager();
  });

  describe('Event Methods', () => {
    it('should add event', async () => {
      const event = { id: '1', type: 'TEST_EVENT' };
      await expect(storageManager.addEvent(event)).resolves.not.toThrow();
    });

    it('should get events', async () => {
      const events = await storageManager.getEvents();
      expect(Array.isArray(events)).toBe(true);
    });

    it('should remove event', async () => {
      await expect(storageManager.removeEvent('event-id')).resolves.not.toThrow();
    });

    it('should clear all events', async () => {
      await expect(storageManager.clearAll()).resolves.not.toThrow();
    });
  });

  describe('Sync Queue Methods', () => {
    it('should add event to sync queue', async () => {
      const event: SyncEvent = {
        id: 'sync-1',
        type: 'SCAN_EVENT',
        timestamp: Date.now(),
        agentId: 'agent-1',
        payload: { qrCode: '123456' },
        metadata: {
          syncState: 'PENDING',
          attempt: 0,
        },
      };

      await expect(storageManager.addToSyncQueue(event)).resolves.not.toThrow();
    });

    it('should get sync queue', async () => {
      const queue = await storageManager.getSyncQueue();
      expect(Array.isArray(queue)).toBe(true);
    });

    it('should remove sync queue item', async () => {
      await expect(storageManager.removeSyncQueueItem('event-id')).resolves.not.toThrow();
    });

    it('should clear sync queue', async () => {
      await expect(storageManager.clearSyncQueue()).resolves.not.toThrow();
    });

    it('should get sync state', async () => {
      const state = await storageManager.getSyncState('event-id');
      expect(['PENDING', 'SYNCED', 'FAILED', null]).toContain(state);
    });

    it('should update sync state', async () => {
      await expect(
        storageManager.updateSyncState('event-id', 'SYNCED')
      ).resolves.not.toThrow();
    });

    it('should get pending sync count', async () => {
      const count = await storageManager.getPendingSyncCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
