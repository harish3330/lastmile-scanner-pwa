/**
 * ISSUE #8 - POST /api/sync Handler
 * Processes sync queue from ISSUE #3 (Sync Manager)
 * Stores events in database that were queued offline
 * 
 * Request: { events: AppEvent[] }
 * Response: SyncResponse
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { syncService, SyncResponse } from '@/services/syncService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      synced: 0,
      failed: 0,
      status: 'error'
    })
  }

  try {
    const { events } = req.body

    if (!Array.isArray(events)) {
      return res.status(400).json({
        synced: 0,
        failed: 0,
        status: 'error'
      })
    }

    const result = await syncService.processSync(events)
    return res.status(200).json(result)
  } catch (error) {
    console.error('[API] POST /api/sync error:', error)
    const eventsLength = Array.isArray(req.body?.events) ? req.body.events.length : 0
    return res.status(500).json({
      synced: 0,
      failed: eventsLength,
      status: 'error'
    })
  }
}
