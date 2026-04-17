/**
 * ISSUE #8 - POST /api/location Handler
 * Records GPS location data from ISSUE #6 (GPS Tracker Module)
 * 
 * Request: LocationRequest
 * Response: { status: string, locationId: string }
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { locationService } from '@/services/locationService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' })
  }

  try {
    const { agentId, latitude, longitude, accuracy, timestamp } = req.body

    const result = await locationService.recordLocation({
      agentId,
      latitude,
      longitude,
      accuracy,
      timestamp
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('[API] POST /api/location error:', error)
    return res.status(400).json({
      message: (error as Error).message || 'Failed to record location'
    })
  }
}
