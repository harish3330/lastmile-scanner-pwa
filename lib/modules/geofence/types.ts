/**
 * Geofence module-specific types
 */

export interface GeoZoneConfig {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // meters
  alertThreshold?: number // distance in meters to trigger pre-alert
}

export interface GeofenceBoundaryResult {
  zoneId: string
  zoneName: string
  isInside: boolean
  distance: number
  latitude: number
  longitude: number
}

export interface GeofenceTransitionEvent {
  zoneId: string
  zoneName: string
  transition: 'entered' | 'exited' | 'no_change'
  distance: number
  latitude: number
  longitude: number
  timestamp: number
}

export interface GeofenceState {
  [zoneId: string]: {
    wasInside: boolean
    lastCheckTime: number
  }
}
