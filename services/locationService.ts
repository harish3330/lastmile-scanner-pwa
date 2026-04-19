/**
 * ISSUE #8 - Location Service
 * Handles GPS location tracking for agents
 * 
 * Dependency: Prisma Client (database)
 * Integration: ISSUE #6 (GPS Tracker) emits LOCATION_EVENTs
 */

import prisma from '@/lib/db/client'

export interface LocationRequest {
  agentId: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp?: number
}

export class LocationService {
  /**
   * Record agent location (GPS)
   * Called from ISSUE #6 (GPS Tracker Module)
   */
  async recordLocation(req: LocationRequest) {
    // Validate required fields
    if (!req.agentId || req.latitude == null || req.longitude == null) {
      throw new Error('Missing required location fields: agentId, latitude, longitude')
    }

    try {
      const location = await prisma.location.create({
        data: {
          agentId: req.agentId,
          latitude: req.latitude,
          longitude: req.longitude,
          accuracy: req.accuracy || 0,
          timestamp: req.timestamp ? new Date(req.timestamp) : new Date()
        }
      })

      // Update agent's last known location
      await prisma.agent.update({
        where: { id: req.agentId },
        data: {
          lastLatitude: req.latitude,
          lastLongitude: req.longitude,
          updatedAt: new Date()
        }
      })

      return {
        status: 'logged',
        locationId: location.id,
        timestamp: location.timestamp.getTime()
      }
    } catch (error) {
      console.error('[LocationService] Error recording location:', error)
      throw new Error('Failed to record location')
    }
  }

  /**
   * Get agent location history (track)
   * Used for route verification and geo-fencing
   */
  async getAgentTrack(agentId: string, hours = 24, limit = 1000) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    try {
      const locations = await prisma.location.findMany({
        where: {
          agentId,
          timestamp: { gte: since }
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      })

      return {
        agentId,
        hours,
        count: locations.length,
        locations
      }
    } catch (error) {
      console.error('[LocationService] Error fetching location history:', error)
      throw error
    }
  }

  /**
   * Get current location of agent
   */
  async getCurrentLocation(agentId: string) {
    try {
      const location = await prisma.location.findFirst({
        where: { agentId },
        orderBy: { timestamp: 'desc' }
      })

      return location
    } catch (error) {
      console.error('[LocationService] Error fetching current location:', error)
      throw error
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c * 1000 // Return in meters
  }

  /**
   * Check if agent is within radius of a location
   */
  isWithinRadius(
    agentLat: number,
    agentLon: number,
    centerLat: number,
    centerLon: number,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(agentLat, agentLon, centerLat, centerLon)
    return distance <= radiusMeters
  }

  /**
   * Get agents within a bounding box
   */
  async getAgentsWithinBounds(minLat: number, minLon: number, maxLat: number, maxLon: number) {
    try {
      // Note: This is a simple implementation
      // In production, use PostGIS for efficient geo queries
      const agents = await prisma.agent.findMany({
        where: {
          AND: [
            { lastLatitude: { gte: minLat, lte: maxLat } },
            { lastLongitude: { gte: minLon, lte: maxLon } }
          ]
        }
      })

      return agents
    } catch (error) {
      console.error('[LocationService] Error getting agents in bounds:', error)
      throw error
    }
  }
}

export const locationService = new LocationService()
