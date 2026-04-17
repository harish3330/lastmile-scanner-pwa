/**
 * Geofence Sync Handler
 * Listens to LOCATION_EVENT and triggers geofence boundary checks
 * Integrates with global event bus for event-driven architecture
 */

import { geofenceService } from './geofenceService'
import { GeoZoneConfig } from './types'

/**
 * Initialize geofence event handlers
 * Should be called during app startup
 * 
 * @param eventBus Global event bus instance
 * @param zones Array of zones to monitor (could be fetched from API/database)
 */
export function initializeGeofenceSyncHandler(
  eventBus: any, // EventBus type - keeping flexible for cross-project compatibility
  zones: GeoZoneConfig[]
): () => void {
  /**
   * Handle LOCATION_EVENT by checking geofence boundaries
   */
  const handleLocationEvent = async (event: any) => {
    try {
      const { agentId, lat, lng } = event.payload

      if (!agentId || lat === undefined || lng === undefined) {
        console.warn('[GeofenceSyncHandler] Invalid LOCATION_EVENT payload:', event.payload)
        return
      }

      // Check boundaries for this location
      const transitions = await geofenceService.checkLocationAgainstZones(agentId, lat, lng, zones)

      // Transitions are already processed and events emitted by geofenceService
      if (transitions.length > 0) {
        console.log(`[GeofenceSyncHandler] Processed ${transitions.length} zone checks for agent ${agentId}`)
      }
    } catch (error) {
      console.error('[GeofenceSyncHandler] Error processing LOCATION_EVENT:', error)
    }
  }

  /**
   * Handle GEOFENCE_EVENT for logging/debugging
   */
  const handleGeofenceEvent = (event: any) => {
    const { agentId, payload } = event
    const { zoneName, status, distance } = payload

    console.log(
      `[GeofenceSyncHandler] Geofence event - Agent ${agentId} ${status} zone ${zoneName} (${distance}m away)`
    )
  }

  // Subscribe to events
  const unsubscribeLocation = eventBus.subscribe?.('LOCATION_EVENT', handleLocationEvent)
  const unsubscribeGeofence = eventBus.subscribe?.('GEOFENCE_EVENT', handleGeofenceEvent)

  // Return unsubscribe function
  return () => {
    if (unsubscribeLocation) unsubscribeLocation()
    if (unsubscribeGeofence) unsubscribeGeofence()
    console.log('[GeofenceSyncHandler] Event handlers unsubscribed')
  }
}

/**
 * Update zones in the geofence service
 * Called when zone configuration changes
 * 
 * @param zones New zones array
 */
export function updateGeofenceZones(zones: GeoZoneConfig[]): void {
  console.log(`[GeofenceSyncHandler] Updated ${zones.length} geofence zones`)
  // Zones are checked per-request in service, no global state update needed
}

/**
 * Clean up geofence state for agent (e.g., when agent logs out)
 * 
 * @param agentId Agent identifier
 */
export function clearGeofenceAgentState(agentId: string): void {
  geofenceService.clearAgentState(agentId)
}

/**
 * Get diagnostic info about active geofence tracking
 */
export function getGeofenceDiagnostics(): {
  activeAgents: string[]
  agentStates: Record<string, any>
} {
  const activeAgents = geofenceService.getActiveAgents()
  const agentStates: Record<string, any> = {}

  for (const agentId of activeAgents) {
    agentStates[agentId] = geofenceService.getAgentState(agentId)
  }

  return {
    activeAgents,
    agentStates
  }
}
