import { indexedDBStore } from './indexedDBStore'
import type { SyncEvent, SyncQueueItem } from '../types/serviceWorker';

export class StorageManager {
  async addEvent(event: any): Promise<void> {
    console.log('[StorageManager] Adding event:', event.id)
    await indexedDBStore.addEvent(event)
  }

  async getEvents(): Promise<any[]> {
    console.log('[StorageManager] Retrieving all events')
    return await indexedDBStore.getEvents()
  }

  async removeEvent(eventId: string): Promise<void> {
    console.log('[StorageManager] Removing event:', eventId)
    await indexedDBStore.removeEvent(eventId)
  }

  async clearAll(): Promise<void> {
    console.log('[StorageManager] Clearing all events')
    await indexedDBStore.clearAll()
  }

  // Sync Queue Methods
  async addToSyncQueue(event: SyncEvent): Promise<void> {
    console.log('[StorageManager] Adding to sync queue:', event.id)
    await indexedDBStore.addEvent(event as any)
  }

  async getSyncQueue(): Promise<SyncEvent[]> {
    console.log('[StorageManager] Retrieving sync queue')
    const events = await indexedDBStore.getPendingEvents()
    return events as SyncEvent[]
  }

  async removeSyncQueueItem(eventId: string): Promise<void> {
    console.log('[StorageManager] Removing sync queue item:', eventId)
    await indexedDBStore.removeEvent(eventId)
  }

  async clearSyncQueue(): Promise<void> {
    console.log('[StorageManager] Clearing sync queue')
    await indexedDBStore.clearAll()
  }

  async getSyncState(eventId: string): Promise<'PENDING' | 'SYNCED' | 'FAILED' | null> {
    console.log('[StorageManager] Getting sync state for:', eventId)
    const events = await indexedDBStore.getEvents()
    const event = events.find(e => e.id === eventId)
    return event?.metadata?.syncState || null
  }

  async updateSyncState(eventId: string, state: 'PENDING' | 'SYNCED' | 'FAILED'): Promise<void> {
    console.log('[StorageManager] Updating sync state for', eventId, 'to', state)
    const events = await indexedDBStore.getEvents()
    const event = events.find(e => e.id === eventId)
    if (event) {
      event.metadata.syncState = state
      await indexedDBStore.updateEvent(event)
    }
  }

  async getPendingSyncCount(): Promise<number> {
    console.log('[StorageManager] Getting pending sync count')
    const pending = await indexedDBStore.getPendingEvents()
    return pending.length
  }
}

export const storageManager = new StorageManager()
