/**
 * ISSUE #4 - Scanner Sync Handler
 * Integrates scanner with EventBus and IndexedDB storage
 * Handles offline persistence and sync queuing
 */

import { eventBus } from '@/lib/events/eventBus'
import { storageManager } from '@/lib/storage/storageManager'
import { ScanResult } from './types'
import { generateUUID } from '@/lib/utils/uuid'

export interface ScanEventPayload {
  id: string
  qrCode: string
  barcode?: string
  format: 'QR_CODE' | 'BARCODE' | 'UPC'
  timestamp: number
  agentId: string
  location?: { lat: number; lng: number }
  syncState: 'PENDING' | 'SYNCED' | 'FAILED'
  attempt: number
}

export class ScanSyncHandler {
  private agentId: string
  private location?: { lat: number; lng: number }

  constructor(agentId: string, location?: { lat: number; lng: number }) {
    this.agentId = agentId
    this.location = location
  }

  /**
   * Handle scan result and emit event
   */
  async handleScanResult(scanResult: ScanResult): Promise<void> {
    const eventPayload: ScanEventPayload = {
      id: generateUUID(),
      qrCode: scanResult.value,
      format: scanResult.format,
      timestamp: scanResult.timestamp,
      agentId: this.agentId,
      location: this.location,
      syncState: 'PENDING',
      attempt: 0
    }

    try {
      // Store in IndexedDB for offline persistence
      await storageManager.store('scans', eventPayload)

      // Emit event to EventBus
      eventBus.emit({
        id: eventPayload.id,
        type: 'SCAN_EVENT',
        timestamp: eventPayload.timestamp,
        agentId: eventPayload.agentId,
        payload: {
          qrCode: eventPayload.qrCode,
          barcode: eventPayload.barcode,
          format: eventPayload.format,
          timestamp: eventPayload.timestamp,
          location: eventPayload.location
        },
        metadata: {
          syncState: 'PENDING',
          attempt: 0
        }
      })

      console.log(`✓ Scan stored and emitted: ${scanResult.value}`)
    } catch (error) {
      console.error('Failed to handle scan result:', error)
      eventBus.emit({
        id: generateUUID(),
        type: 'SCAN_EVENT',
        timestamp: Date.now(),
        agentId: this.agentId,
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          syncState: 'FAILED',
          attempt: 0
        }
      })
    }
  }

  /**
   * Get pending scans from storage
   */
  async getPendingScans(): Promise<ScanEventPayload[]> {
    try {
      const scans = await storageManager.getAll('scans')
      return scans.filter((scan: any) => scan.syncState === 'PENDING') as ScanEventPayload[]
    } catch (error) {
      console.error('Failed to get pending scans:', error)
      return []
    }
  }

  /**
   * Mark scan as synced
   */
  async markScanSynced(scanId: string): Promise<void> {
    try {
      const scan = await storageManager.get('scans', scanId)
      if (scan) {
        scan.syncState = 'SYNCED'
        await storageManager.store('scans', scan)
      }
    } catch (error) {
      console.error(`Failed to mark scan ${scanId} as synced:`, error)
    }
  }

  /**
   * Mark scan as failed
   */
  async markScanFailed(scanId: string, attempt: number): Promise<void> {
    try {
      const scan = await storageManager.get('scans', scanId)
      if (scan) {
        scan.syncState = attempt >= 3 ? 'FAILED' : 'PENDING'
        scan.attempt = attempt
        await storageManager.store('scans', scan)
      }
    } catch (error) {
      console.error(`Failed to mark scan ${scanId} as failed:`, error)
    }
  }

  /**
   * Clear scan history
   */
  async clearScanHistory(): Promise<void> {
    try {
      await storageManager.clear('scans')
    } catch (error) {
      console.error('Failed to clear scan history:', error)
    }
  }

  /**
   * Update agent location
   */
  setLocation(location: { lat: number; lng: number }): void {
    this.location = location
  }
}

/**
 * Global sync handler instance
 */
let syncHandlerInstance: ScanSyncHandler | null = null

export function initScanSyncHandler(agentId: string, location?: { lat: number; lng: number }): ScanSyncHandler {
  syncHandlerInstance = new ScanSyncHandler(agentId, location)
  return syncHandlerInstance
}

export function getScanSyncHandler(): ScanSyncHandler {
  if (!syncHandlerInstance) {
    throw new Error('ScanSyncHandler not initialized. Call initScanSyncHandler first.')
  }
  return syncHandlerInstance
}
