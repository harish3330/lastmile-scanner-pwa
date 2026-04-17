/**
 * Geofence Service Layer
 * Business logic for boundary detection, state tracking, and event emission
 * Depends on: algorithms (pure functions), eventBus (event emission)
 */

import { v4 as uuid } from 'uuid'
import {
  checkMultipleZoneBoundaries,
  determineTransition,
  checkSingleZoneBoundary
} from './algorithms'
import { GeofenceState, GeoZoneConfig, GeofenceTransitionEvent } from './types'

// Note: In production, import from actual eventBus location
// For now, we'll create a mock/adapter since eventBus may not be fully implemented
interface EventBusAdapter {
  emit: (event: any) => void
}

let eventBusInstance: EventBusAdapter | null = null

/**
 * Set the event bus instance for this service
 * Should be called during app initialization
 */
export function setGeofenceEventBus(eventBus: EventBusAdapter): void {
  eventBusInstance = eventBus
}

/**
 * Get the event bus instance
 */
function getEventBus(): EventBusAdapter {
  if (!eventBusInstance) {
    // Fallback: create a no-op event bus
    return {
      emit: (event) => {
        console.log('[GeofenceService] Event emitted (no event bus configured):', event)
      }
    }
  }
  return eventBusInstance
}

/**
 * Main geofence service class
 * Tracks agent location against zones and emits events on boundary changes
 */
export class GeofenceService {
  private state: Map<string, GeofenceState> = new Map() // agentId -> zone states

  /**
   * Check agent location against zones and emit events on transitions
   * 
   * @param agentId Agent identifier
   * @param latitude Current latitude
   * @param longitude Current longitude
   * @param zones Array of zones to check
   * @returns Array of transition events
   */
  async checkLocationAgainstZones(
    agentId: string,
    latitude: number,
    longitude: number,
    zones: GeoZoneConfig[]
  ): Promise<GeofenceTransitionEvent[]> {
    const eventBus = getEventBus()
    const transitionEvents: GeofenceTransitionEvent[] = []

    // Ensure agent state exists
    if (!this.state.has(agentId)) {
      this.state.set(agentId, {})
    }

    const agentState = this.state.get(agentId)!

    // Check each zone
    const boundaryResults = checkMultipleZoneBoundaries(latitude, longitude, zones)

    for (const result of boundaryResults) {
      const zoneId = result.zoneId
      const currentInside = result.isInside
      const previousState = agentState[zoneId]
      const wasInside = previousState?.wasInside

      // Determine transition
      const transition = determineTransition(wasInside, currentInside)

      // Create transition event
      const transitionEvent: GeofenceTransitionEvent = {
        zoneId,
        zoneName: result.zoneName,
        transition,
        distance: result.distance,
        latitude: result.latitude,
        longitude: result.longitude,
        timestamp: Date.now()
      }

      transitionEvents.push(transitionEvent)

      // Update state
      agentState[zoneId] = {
        wasInside: currentInside,
        lastCheckTime: Date.now()
      }

      // Only emit event if transition occurred
      if (transition !== 'no_change') {
        const geofenceEvent = {
          id: uuid(),
          type: 'GEOFENCE_EVENT',
          timestamp: Date.now(),
          agentId,
          payload: {
            zoneId,
            zoneName: result.zoneName,
            status: transition === 'entered' ? 'entered' : 'exited',
            distance: result.distance,
            latitude: result.latitude,
            longitude: result.longitude,
            timestamp: Date.now()
          },
          metadata: {
            syncState: 'PENDING',
            attempt: 0
          }
        }

        eventBus.emit(geofenceEvent)

        console.log(`[GeofenceService] Agent ${agentId} ${transition} zone ${result.zoneName}`)
      }
    }

    return transitionEvents
  }

  /**
   * Get current status for a specific zone
   * 
   * @param agentId Agent identifier
   * @param zone Zone to check
   * @param latitude Current latitude
   * @param longitude Current longitude
   * @returns Current status and distance
   */
  async getZoneStatus(
    agentId: string,
    zone: GeoZoneConfig,
    latitude: number,
    longitude: number
  ): Promise<{
    isInside: boolean
    distance: number
    lastCheck: number
  }> {
    const result = checkSingleZoneBoundary(
      latitude,
      longitude,
      zone.id,
      zone.name,
      zone.latitude,
      zone.longitude,
      zone.radius
    )

    return {
      isInside: result.isInside,
      distance: result.distance,
      lastCheck: Date.now()
    }
  }

  /**
   * Clear state for an agent (e.g., when agent logs out)
   * 
   * @param agentId Agent identifier
   */
  clearAgentState(agentId: string): void {
    this.state.delete(agentId)
    console.log(`[GeofenceService] State cleared for agent ${agentId}`)
  }

  /**
   * Get all active agents currently tracked
   * 
   * @returns Array of agent IDs
   */
  getActiveAgents(): string[] {
    return Array.from(this.state.keys())
  }

  /**
   * Get state for specific agent
   * 
   * @param agentId Agent identifier
   * @returns Agent's zone state
   */
  getAgentState(agentId: string): GeofenceState | undefined {
    return this.state.get(agentId)
  }
}

// Export singleton instance
export const geofenceService = new GeofenceService()
