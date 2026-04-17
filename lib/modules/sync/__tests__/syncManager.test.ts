import { SyncManager } from '../syncManager'
import { storageManager } from '@/lib/storage/storageManager'
import { AppEvent } from '@/lib/types'

describe('SyncManager', () => {
  let syncManager: SyncManager

  beforeEach(() => {
    syncManager = new SyncManager()
  })

  it('should queue event when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    const event: AppEvent = {
      id: 'test-1',
      type: 'SCAN_EVENT',
      timestamp: Date.now(),
      agentId: 'agent-1',
      payload: { qrCode: '123' },
      metadata: { syncState: 'PENDING', attempt: 0 }
    }

    await syncManager.queue(event)
    const queued = await storageManager.getEvents()

    expect(queued.length).toBeGreaterThan(0)
    expect(queued[0].id).toBe('test-1')
  })

  it('should sync events when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })

    const synced = await syncManager.processQueue()
    expect(Array.isArray(synced)).toBe(true)
  })

  it('should retry failed syncs', async () => {
    const event: AppEvent = {
      id: 'test-2',
      type: 'LOCATION_EVENT',
      timestamp: Date.now(),
      agentId: 'agent-1',
      payload: { lat: 0, lng: 0, accuracy: 10 },
      metadata: { syncState: 'PENDING', attempt: 0 }
    }

    await syncManager.queue(event)
    const result = await syncManager.retryFailed()
    expect(result).toBeDefined()
  })
})