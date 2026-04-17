/**
 * ISSUE #8 - Sync Service
 * Handles syncing queued events from offline storage to database
 * 
 * Dependency: Prisma Client (database), Issue #3 Sync Manager
 * Integration: Receives SYNC events from Issue #3
 */

import prisma from '@/lib/db/client'

export interface SyncEvent {
  id: string
  type: string
  agentId: string
  eventData: any
  metadata: {
    syncState: 'PENDING' | 'SYNCED' | 'FAILED'
    attempt: number
  }
}

export interface SyncResponse {
  synced: number
  failed: number
  status: 'success' | 'partial' | 'error'
  errors?: Array<{ eventId: string; error: string }>
}

export class SyncService {
  /**
   * Process sync queue
   * Takes array of queued events from Issue #3 (Sync Manager)
   * Stores them in database
   */
  async processSync(events: SyncEvent[]): Promise<SyncResponse> {
    if (!events || events.length === 0) {
      return { synced: 0, failed: 0, status: 'success' }
    }

    let synced = 0
    let failed = 0
    const errors: Array<{ eventId: string; error: string }> = []

    for (const event of events) {
      try {
        // Update sync queue status
        await prisma.syncQueue.update({
          where: { eventId: event.id },
          data: {
            status: 'SYNCED',
            syncedAt: new Date()
          }
        })

        synced++
      } catch (error) {
        console.error(`[SyncService] Failed to sync event ${event.id}:`, error)
        failed++
        errors.push({
          eventId: event.id,
          error: (error as Error).message
        })

        // Update attempts in sync queue
        try {
          await prisma.syncQueue.update({
            where: { eventId: event.id },
            data: {
              status: 'FAILED',
              attempt: { increment: 1 },
              error: (error as Error).message
            }
          })
        } catch (e) {
          // Ignore error during update
        }
      }
    }

    const status = failed === 0 ? 'success' : failed < synced ? 'partial' : 'error'

    return { synced, failed, status, ...(errors.length > 0 && { errors }) }
  }

  /**
   * Get pending sync events
   * Used for debugging and monitoring sync status
   */
  async getPendingEvents(agentId?: string, limit = 100) {
    try {
      const events = await prisma.syncQueue.findMany({
        where: {
          status: 'PENDING',
          ...(agentId && { agentId })
        },
        orderBy: { createdAt: 'asc' },
        take: limit
      })

      return events
    } catch (error) {
      console.error('[SyncService] Error fetching pending events:', error)
      throw error
    }
  }

  /**
   * Get failed events (for retry)
   */
  async getFailedEvents(maxAttempts = 3) {
    try {
      const events = await prisma.syncQueue.findMany({
        where: {
          status: 'FAILED',
          attempt: { lt: maxAttempts }
        },
        orderBy: { createdAt: 'asc' }
      })

      return events
    } catch (error) {
      console.error('[SyncService] Error fetching failed events:', error)
      throw error
    }
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(maxAttempts = 3): Promise<SyncResponse> {
    const failedEvents = await this.getFailedEvents(maxAttempts)

    if (failedEvents.length === 0) {
      return { synced: 0, failed: 0, status: 'success' }
    }

    // Convert to SyncEvent format and process
    const events: SyncEvent[] = failedEvents.map(e => ({
      id: e.id,
      type: e.eventType,
      agentId: e.agentId,
      eventData: e.eventData,
      metadata: {
        syncState: e.status as 'PENDING' | 'SYNCED' | 'FAILED',
        attempt: e.attempt
      }
    }))

    return this.processSync(events)
  }

  /**
   * Get sync statistics
   * Used for admin dashboard
   */
  async getSyncStats(agentId?: string) {
    try {
      const total = await prisma.syncQueue.count({
        where: agentId ? { agentId } : undefined
      })

      const synced = await prisma.syncQueue.count({
        where: {
          status: 'SYNCED',
          ...(agentId && { agentId })
        }
      })

      const pending = await prisma.syncQueue.count({
        where: {
          status: 'PENDING',
          ...(agentId && { agentId })
        }
      })

      const failed = await prisma.syncQueue.count({
        where: {
          status: 'FAILED',
          ...(agentId && { agentId })
        }
      })

      return {
        total,
        synced,
        pending,
        failed,
        syncRate: total > 0 ? (synced / total) * 100 : 0
      }
    } catch (error) {
      console.error('[SyncService] Error getting sync stats:', error)
      throw error
    }
  }
}

export const syncService = new SyncService()
