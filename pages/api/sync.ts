// ============================================================
//  pages/api/sync.ts — OFFLINE SYNC
//  Processes queued events from offline agents
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { SyncRequest, SyncResponse } from '@/lib/types/api'
import { AppEvent } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { events, agentId }: SyncRequest = req.body

    // Validate input
    if (!Array.isArray(events) || !agentId) {
      return res.status(400).json({ error: 'Invalid sync request' })
    }

    let synced = 0
    let failed = 0
    const errors: { eventId: string; error: string }[] = []

    // Process each event
    for (const event of events) {
      try {
        await processEvent(event)
        synced++
      } catch (error: any) {
        failed++
        errors.push({
          eventId: event.id,
          error: error.message || 'Unknown error',
        })
      }
    }

    console.log(`[API] Sync completed: ${synced} synced, ${failed} failed`)

    const response: SyncResponse = {
      synced,
      failed,
      errors,
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('[API] Sync error:', error)
    return res.status(500).json({ error: 'Failed to process sync' })
  }
}

// Helper function to process individual events
async function processEvent(event: AppEvent): Promise<void> {
  const { type, id, agentId, payload } = event

  switch (type) {
    case 'SCAN_EVENT':
      await prisma.scan.create({
        data: {
          agentId,
          qrCode: payload.qrCode || '',
        },
      })
      break

    case 'LOCATION_EVENT':
      await prisma.location.create({
        data: {
          agentId,
          latitude: payload.lat || 0,
          longitude: payload.lng || 0,
        },
      })
      break

    case 'DELIVERY_EVENT':
      console.log(`[Sync] Delivery event: ${payload.deliveryId}`)
      break

    case 'PAYMENT_EVENT':
      console.log(`[Sync] Payment event: ${payload.amount}`)
      break

    case 'DETECTION_EVENT':
      console.log(`[Sync] Detection event: ${payload.label}`)
      break

    default:
      throw new Error(`Unknown event type: ${type}`)
  }
}
