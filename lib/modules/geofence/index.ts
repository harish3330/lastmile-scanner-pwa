/**
 * Geofence Module - Public API
 * Exports core functionality for boundary detection and event handling
 */

// Algorithm exports (pure functions)
export {
  calculateHaversineDistance,
  isPointInCircle,
  distanceFromZoneBoundary,
  checkSingleZoneBoundary,
  checkMultipleZoneBoundaries,
  determineTransition
} from './algorithms'

// Service exports (business logic)
export { geofenceService, setGeofenceEventBus } from './geofenceService'
export type { GeofenceService } from './geofenceService'

// Event handling exports
export {
  initializeGeofenceSyncHandler,
  updateGeofenceZones,
  clearGeofenceAgentState,
  getGeofenceDiagnostics
} from './syncHandler'

// Type exports
export type { GeoZoneConfig, GeofenceBoundaryResult, GeofenceTransitionEvent, GeofenceState } from './types'

// Re-export from shared types
export type { GeofenceEvent, GeofenceResult, ZoneBoundary } from '@/lib/types'
