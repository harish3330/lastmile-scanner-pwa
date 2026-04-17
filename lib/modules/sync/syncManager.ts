import { AppEvent } from '@/lib/types'
import { storageManager } from '@/lib/storage/storageManager'
import { eventBus } from '@/lib/events/eventBus'

export class SyncManager {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  private maxRetries = 3
  private syncInProgress = false

  constructor() {
    this.setupOnlineListener()
  }

  async queue(event: AppEvent): Promise<void> {
    if (!navigator.onLine) {
      // Queue offline
      await storageManager.addEvent(event)
      console.log('[SyncManager] Event queued offline:', event.id)
      eventBus.emit({ ...event, type: 'SYNC_QUEUED' })
    } else {
      // Send immediately
      try {
        await this.sendEvent(event)
        eventBus.emit({ ...event, type: 'SYNC_SUCCESS' })
      } catch (error) {
        console.error('[SyncManager] Failed to send event immediately:', error)
        await storageManager.addEvent(event)
        eventBus.emit({ ...event, type: 'SYNC_FAILED' })
      }
    }
  }

  async processQueue(): Promise<AppEvent[]> {
    if (this.syncInProgress) {
      console.log('[SyncManager] Sync already in progress, skipping')
      return []
    }

    this.syncInProgress = true
    const events = await storageManager.getEvents()
    const synced: AppEvent[] = []

    console.log('[SyncManager] Processing queue with', events.length, 'events')

    for (const event of events) {
      try {
        await this.sendEvent(event)
        synced.push(event)
        await storageManager.removeEvent(event.id)
        eventBus.emit({ ...event, type: 'SYNC_SUCCESS' })
      } catch (error) {
        console.error('[SyncManager] Sync failed for event:', event.id, error)
        event.metadata.attempt++
        await storageManager.updateEvent(event)
        eventBus.emit({ ...event, type: 'SYNC_FAILED' })
      }
    }

    this.syncInProgress = false
    console.log('[SyncManager] Sync complete. Synced:', synced.length, 'Failed:', events.length - synced.length)
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
          eventBus.emit({ ...event, type: 'SYNC_RETRY_SUCCESS' })
        } catch (error) {
          console.error('[SyncManager] Retry failed for event:', event.id)
          event.metadata.attempt++
          await storageManager.updateEvent(event)
        }
      } else {
        console.warn('[SyncManager] Max retries exceeded for event:', event.id)
        eventBus.emit({ ...event, type: 'SYNC_MAX_RETRIES' })
      }
    }

    return retried
  }

  private async sendEvent(event: AppEvent): Promise<void> {
    const endpoint = this.getEndpointForEventType(event.type)
    
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    if (!response.ok) {
      throw new Error(`[SyncManager] API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[SyncManager] Event synced successfully:', event.id, data)
  }

  private getEndpointForEventType(eventType: string): string {
    const endpointMap: Record<string, string> = {
      SCAN_EVENT: '/api/events/scan',
      LOCATION_EVENT: '/api/events/location',
      DELIVERY_EVENT: '/api/events/delivery',
      PAYMENT_EVENT: '/api/events/payment',
      DETECTION_EVENT: '/api/events/detection',
      GEOFENCE_EVENT: '/api/events/geofence',
      IMAGE_CAPTURE_EVENT: '/api/events/image',
      OTP_EVENT: '/api/events/otp',
      WHATSAPP_EVENT: '/api/events/whatsapp',
      SYNC_EVENT: '/api/events/sync'
    }
    return endpointMap[eventType] || '/api/events/generic'
  }

  setupOnlineListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncManager] Back online, processing queue')
        this.processQueue()
      })

      window.addEventListener('offline', () => {
        console.log('[SyncManager] Gone offline, queuing events')
      })
    }
  }

  async getQueueStatus(): Promise<{ total: number; pending: number; failed: number }> {
    const events = await storageManager.getEvents()
    const pending = events.filter(e => e.metadata.syncState === 'PENDING').length
    const failed = events.filter(e => e.metadata.syncState === 'FAILED').length

    return {
      total: events.length,
      pending,
      failed
    }
  }
}

export const syncManager = new SyncManager()