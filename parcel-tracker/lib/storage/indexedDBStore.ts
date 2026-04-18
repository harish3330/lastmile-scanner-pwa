// Real IndexedDB implementation for storage
import { AppEvent } from '@/lib/types'

const DB_NAME = 'lastmile-scanner'
const STORE_NAME = 'events'
const DB_VERSION = 1

export class IndexedDBStore {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('[IndexedDB] Failed to open database')
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('[IndexedDB] Database opened successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('syncState', 'metadata.syncState', { unique: false })
          console.log('[IndexedDB] Object store created')
        }
      }
    })
  }

  async addEvent(event: AppEvent): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(event)

      request.onerror = () => {
        console.error('[IndexedDB] Failed to add event:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        console.log('[IndexedDB] Event added:', event.id)
        resolve()
      }
    })
  }

  async getEvents(): Promise<AppEvent[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => {
        console.error('[IndexedDB] Failed to get events')
        reject(request.error)
      }

      request.onsuccess = () => {
        console.log('[IndexedDB] Retrieved', request.result.length, 'events')
        resolve(request.result as AppEvent[])
      }
    })
  }

  async removeEvent(eventId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(eventId)

      request.onerror = () => {
        console.error('[IndexedDB] Failed to remove event')
        reject(request.error)
      }

      request.onsuccess = () => {
        console.log('[IndexedDB] Event removed:', eventId)
        resolve()
      }
    })
  }

  async updateEvent(event: AppEvent): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(event)

      request.onerror = () => {
        console.error('[IndexedDB] Failed to update event')
        reject(request.error)
      }

      request.onsuccess = () => {
        console.log('[IndexedDB] Event updated:', event.id)
        resolve()
      }
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onerror = () => {
        console.error('[IndexedDB] Failed to clear store')
        reject(request.error)
      }

      request.onsuccess = () => {
        console.log('[IndexedDB] Store cleared')
        resolve()
      }
    })
  }

  async getEventsByType(type: string): Promise<AppEvent[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('type')
      const request = index.getAll(type)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result as AppEvent[])
    })
  }

  async getPendingEvents(): Promise<AppEvent[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const pending = (request.result as AppEvent[]).filter(
          e => e.metadata.syncState === 'PENDING'
        )
        resolve(pending)
      }
    })
  }
}

export const indexedDBStore = new IndexedDBStore()
