// STUB - replace with real implementation later
import type { SyncEvent, SyncQueueItem } from '../types/serviceWorker';

export class StorageManager {
  async addEvent(event: any): Promise<void> {
    console.log('StorageManager.addEvent called with', event);
  }

  async getEvents(): Promise<any[]> {
    console.log('StorageManager.getEvents called');
    return [];
  }

  async removeEvent(eventId: string): Promise<void> {
    console.log('StorageManager.removeEvent called with', eventId);
  }

  async clearAll(): Promise<void> {
    console.log('StorageManager.clearAll called');
  }

  // Sync Queue Methods
  async addToSyncQueue(event: SyncEvent): Promise<void> {
    console.log('StorageManager.addToSyncQueue called with', event);
  }

  async getSyncQueue(): Promise<SyncEvent[]> {
    console.log('StorageManager.getSyncQueue called');
    return [];
  }

  async removeSyncQueueItem(eventId: string): Promise<void> {
    console.log('StorageManager.removeSyncQueueItem called with', eventId);
  }

  async clearSyncQueue(): Promise<void> {
    console.log('StorageManager.clearSyncQueue called');
  }

  async getSyncState(eventId: string): Promise<'PENDING' | 'SYNCED' | 'FAILED' | null> {
    console.log('StorageManager.getSyncState called for', eventId);
    return null;
  }

  async updateSyncState(eventId: string, state: 'PENDING' | 'SYNCED' | 'FAILED'): Promise<void> {
    console.log('StorageManager.updateSyncState called for', eventId, 'with state', state);
  }

  async getPendingSyncCount(): Promise<number> {
    console.log('StorageManager.getPendingSyncCount called');
    return 0;
  }
}

export const storageManager = new StorageManager();
