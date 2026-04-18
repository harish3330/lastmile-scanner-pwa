// ============================================================
//  pages/api/location.ts — ISSUE #6 & #8
//  Receives GPS location updates from agents
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { LocationRequest, LocationResponse } from '@/lib/types/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { agentId, latitude, longitude, accuracy, timestamp }: LocationRequest = req.body

    // Validate required fields
    if (!agentId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Store location in database
    const location = await prisma.location.create({
      data: {
        agentId,
        latitude,
        longitude,
        accuracy: accuracy || 0,
      },
    })

    // Update agent's last known location
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        lastLatitude: latitude,
        lastLongitude: longitude,
      },
    })

    // Check if agent is in any geofence (ISSUE #7)
    const geoZones = await prisma.geoZone.findMany()
    for (const zone of geoZones) {
      const distance = calculateDistance(
        latitude,
        longitude,
        zone.latitude,
        zone.longitude
      )

      if (distance <= zone.radius) {
        // Log geofence alert
        await prisma.geofenceAlert.create({
          data: {
            agentId,
            zoneId: zone.id,
            status: 'entered',
            distance,
          },
        })
      }
    }

    console.log('[API] Location recorded:', location.id, `${latitude}, ${longitude}`)

    const response: LocationResponse = {
      locationId: location.id,
      agentId: location.agentId,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: location.createdAt.getTime(),
    }

    return res.status(201).json(response)
  } catch (error) {
    console.error('[API] Location error:', error)
    return res.status(500).json({ error: 'Failed to record location' })
  }
}

// Haversine distance formula (in meters)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.asin(Math.sqrt(a))
  return R * c
}
