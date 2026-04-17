/**
 * PURE GEOFENCE ALGORITHMS
 * Framework-agnostic, testable functions for geofence calculations
 * No side effects, no API calls, no database access
 */

/**
 * Calculate distance between two geographic points using Haversine formula
 * Returns distance in meters
 * 
 * @param lat1 Latitude of first point (degrees)
 * @param lng1 Longitude of first point (degrees)
 * @param lat2 Latitude of second point (degrees)
 * @param lng2 Longitude of second point (degrees)
 * @returns Distance in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Check if a point is inside a circular geofence zone
 * 
 * @param agentLat Agent's latitude
 * @param agentLng Agent's longitude
 * @param centerLat Zone center latitude
 * @param centerLng Zone center longitude
 * @param radiusMeters Zone radius in meters
 * @returns True if point is inside zone, false otherwise
 */
export function isPointInCircle(
  agentLat: number,
  agentLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): boolean {
  const distance = calculateHaversineDistance(agentLat, agentLng, centerLat, centerLng)
  return distance <= radiusMeters
}

/**
 * Calculate distance from point to circular zone boundary
 * Positive = outside zone, Negative = inside zone
 * 
 * @param agentLat Agent's latitude
 * @param agentLng Agent's longitude
 * @param centerLat Zone center latitude
 * @param centerLng Zone center longitude
 * @param radiusMeters Zone radius in meters
 * @returns Distance in meters (positive = outside, negative = inside)
 */
export function distanceFromZoneBoundary(
  agentLat: number,
  agentLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): number {
  const distance = calculateHaversineDistance(agentLat, agentLng, centerLat, centerLng)
  return distance - radiusMeters
}

/**
 * Check geofence boundary for a single zone
 * Returns detailed result including distance and status
 * 
 * @param agentLat Agent's latitude
 * @param agentLng Agent's longitude
 * @param zoneId Zone ID
 * @param zoneName Zone name
 * @param centerLat Zone center latitude
 * @param centerLng Zone center longitude
 * @param radiusMeters Zone radius in meters
 * @returns Geofence result with status and distance
 */
export function checkSingleZoneBoundary(
  agentLat: number,
  agentLng: number,
  zoneId: string,
  zoneName: string,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): {
  zoneId: string
  zoneName: string
  isInside: boolean
  distance: number
  latitude: number
  longitude: number
} {
  const isInside = isPointInCircle(agentLat, agentLng, centerLat, centerLng, radiusMeters)
  const distance = calculateHaversineDistance(agentLat, agentLng, centerLat, centerLng)

  return {
    zoneId,
    zoneName,
    isInside,
    distance: Math.round(distance * 100) / 100,
    latitude: agentLat,
    longitude: agentLng
  }
}

/**
 * Check geofence boundary for multiple zones
 * Returns results for all zones
 * 
 * @param agentLat Agent's latitude
 * @param agentLng Agent's longitude
 * @param zones Array of zones to check
 * @returns Array of boundary check results
 */
export function checkMultipleZoneBoundaries(
  agentLat: number,
  agentLng: number,
  zones: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    radius: number
  }>
): Array<{
  zoneId: string
  zoneName: string
  isInside: boolean
  distance: number
  latitude: number
  longitude: number
}> {
  return zones.map((zone) =>
    checkSingleZoneBoundary(
      agentLat,
      agentLng,
      zone.id,
      zone.name,
      zone.latitude,
      zone.longitude,
      zone.radius
    )
  )
}

/**
 * Determine transition status between old and new state
 * Used to detect when agent enters or exits a zone
 * 
 * @param wasInside Previous state (inside zone)
 * @param isNowInside Current state (inside zone)
 * @returns Transition status: 'entered', 'exited', or 'no_change'
 */
export function determineTransition(
  wasInside: boolean,
  isNowInside: boolean
): 'entered' | 'exited' | 'no_change' {
  if (wasInside === undefined) {
    // First time checking, return no_change to avoid spurious events
    return 'no_change'
  }

  if (!wasInside && isNowInside) {
    return 'entered'
  }

  if (wasInside && !isNowInside) {
    return 'exited'
  }

  return 'no_change'
}
