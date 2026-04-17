import { AppEvent } from '@/lib/types'
import { storageManager } from '@/lib/storage/storageManager'

export class SyncManager {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  private maxRetries = 3

  async queue(event: AppEvent): Promise<void> {
    if (!navigator.onLine) {
      // Queue offline
      await storageManager.addEvent(event)
      console.log('[SyncManager] Event queued offline:', event.id)
    } else {
      // Send immediately
      await this.sendEvent(event)
    }
  }

  async processQueue(): Promise<AppEvent[]> {
    const events = await storageManager.getEvents()
    const synced: AppEvent[] = []

    for (const event of events) {
      try {
        await this.sendEvent(event)
        synced.push(event)
        await storageManager.removeEvent(event.id)
      } catch (error) {
        console.error('[SyncManager] Sync failed for event:', event.id, error)
      }
    }

    return synced
  }

  async retryFailed(): Promise<number> {
    const events = await storageManager.getEvents()
    let retried = 0

    for (const event of events) {
      if (event.metadata.attempt < this.maxRetries) {
        try {
          await this.sendEvent(event)
          await storageManager.removeEvent(event.id)
          retried++
        } catch (error) {
          // Will retry next time
        }
      }
    }

    return retried
  }

  private async sendEvent(event: AppEvent): Promise<void> {
    const response = await fetch(`${this.apiUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [event] })
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  }

  setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[SyncManager] Back online, processing queue')
      this.processQueue()
    })
  }
}

export const syncManager = new SyncManager()