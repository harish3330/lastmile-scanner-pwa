/**
 * Offline Storage Manager
 * Handles local storage for offline-first PWA capabilities
 */

interface StoredEvent {
  id: string
  type: string
  data: any
  timestamp: number
  synced: boolean
}

class OfflineStorageManager {
  private storeName = 'pwa-scanner-events'

  /**
   * Save event to local storage
   */
  async saveEvent(event: StoredEvent): Promise<void> {
    try {
      const events = this.getAllEvents()
      events.push(event)
      localStorage.setItem(this.storeName, JSON.stringify(events))
    } catch (error) {
      console.error('Failed to save event to storage:', error)
      throw error
    }
  }

  /**
   * Get all stored events
   */
  getAllEvents(): StoredEvent[] {
    try {
      const data = localStorage.getItem(this.storeName)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get events from storage:', error)
      return []
    }
  }

  /**
   * Get unsynced events
   */
  getUnsyncedEvents(): StoredEvent[] {
    return this.getAllEvents().filter(e => !e.synced)
  }

  /**
   * Mark event as synced
   */
  markAsSynced(eventId: string): void {
    try {
      const events = this.getAllEvents()
      const event = events.find(e => e.id === eventId)
      if (event) {
        event.synced = true
        localStorage.setItem(this.storeName, JSON.stringify(events))
      }
    } catch (error) {
      console.error('Failed to mark event as synced:', error)
    }
  }

  /**
   * Clear all events
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.storeName)
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  /**
   * Get storage stats
   */
  getStats(): { totalEvents: number; syncedEvents: number; unsyncedEvents: number } {
    const events = this.getAllEvents()
    return {
      totalEvents: events.length,
      syncedEvents: events.filter(e => e.synced).length,
      unsyncedEvents: events.filter(e => !e.synced).length,
    }
  }
}

export const offlineStorage = new OfflineStorageManager()
