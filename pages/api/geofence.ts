/**
 * ISSUE #7 - POST /api/geofence Handler
 * Checks if delivery agent is inside or outside defined zones
 * Triggers GEOFENCE_EVENT when boundaries are crossed
 * 
 * Request: GeofenceCheckRequest
 * Response: GeofenceCheckResponse[]
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { geofenceService, setGeofenceEventBus } from '@/lib/modules/geofence'
import { eventBus } from '@/lib/events/eventBus'
import prisma from '@/lib/db/client'

// Initialize event bus for geofence service
setGeofenceEventBus(eventBus)

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' })
  }

  try {
    const { agentId, latitude, longitude, timestamp } = req.body

    // Validate required fields
    if (!agentId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: agentId, latitude, longitude'
      })
    }

    // Fetch all active zones from database
    const zones = await prisma.geoZone.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        radius: true,
        alertThreshold: true
      }
    })

    if (zones.length === 0) {
      return res.status(200).json({
        message: 'No zones configured',
        results: []
      })
    }

    // Check geofence boundaries
    const transitions = await geofenceService.checkLocationAgainstZones(
      agentId,
      latitude,
      longitude,
      zones
    )

    // Get current status for all zones
    const results = await Promise.all(
      zones.map(async (zone) => {
        const status = await geofenceService.getZoneStatus(agentId, zone as any, latitude, longitude)

        return {
          zoneId: zone.id,
          zoneName: zone.name,
          status: status.isInside ? 'entered' : 'exited',
          distance: status.distance,
          isInside: status.isInside,
          timestamp: timestamp || Date.now()
        }
      })
    )

    // Log API call
    console.log(
      `[API] Geofence check for agent ${agentId} at (${latitude}, ${longitude}): ${results.length} zones checked`
    )

    return res.status(200).json({
      agentId,
      latitude,
      longitude,
      results,
      checkedZones: zones.length,
      transitionsDetected: transitions.filter((t) => t.transition !== 'no_change').length,
      timestamp: timestamp || Date.now()
    })
  } catch (error) {
    console.error('[API] POST /api/geofence error:', error)
    return res.status(500).json({
      message: (error as Error).message || 'Failed to check geofence',
      error: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    })
  }
}
