/**
 * Unit tests for GeofenceService
 * Tests service layer: event emission, state tracking, transitions
 */

import { GeofenceService, setGeofenceEventBus } from '../geofenceService'
import { GeoZoneConfig } from '../types'

describe('GeofenceService', () => {
  let service: GeofenceService
  let emittedEvents: any[] = []
  let mockEventBus = {
    emit: (event: any) => {
      emittedEvents.push(event)
    }
  }

  beforeEach(() => {
    service = new GeofenceService()
    emittedEvents = []
    setGeofenceEventBus(mockEventBus)
  })

  const testZones: GeoZoneConfig[] = [
    {
      id: 'zone-1',
      name: 'Warehouse A',
      latitude: 40.7128,
      longitude: -74.006,
      radius: 500
    },
    {
      id: 'zone-2',
      name: 'Delivery Hub B',
      latitude: 40.7228,
      longitude: -74.006,
      radius: 300
    }
  ]

  describe('checkLocationAgainstZones', () => {
    it('should return empty transitions on first check (no previous state)', async () => {
      const transitions = await service.checkLocationAgainstZones('agent-1', 40.7128, -74.006, [
        testZones[0]
      ])

      // First time check should return no_change transitions
      expect(transitions.length).toBe(1)
      expect(transitions[0].transition).toBe('no_change')
    })

    it('should emit GEOFENCE_EVENT when agent enters zone', async () => {
      const agentId = 'agent-1'

      // First check: outside zone
      await service.checkLocationAgainstZones(agentId, 40.8128, -74.006, testZones)
      expect(emittedEvents.length).toBe(0) // No events (first check)

      // Second check: inside zone
      const transitions = await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, testZones)

      // Should emit event for entering zone-1
      expect(emittedEvents.length).toBeGreaterThan(0)
      const enterEvent = emittedEvents.find((e) => e.type === 'GEOFENCE_EVENT')
      expect(enterEvent).toBeDefined()
      expect(enterEvent?.payload.status).toBe('entered')
      expect(enterEvent?.payload.zoneId).toBe('zone-1')
    })

    it('should emit GEOFENCE_EVENT when agent exits zone', async () => {
      const agentId = 'agent-2'

      // First check: inside zone
      await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, testZones)
      emittedEvents = [] // Clear events

      // Second check: outside zone
      const transitions = await service.checkLocationAgainstZones(agentId, 40.8128, -74.006, testZones)

      // Should emit event for exiting zone-1
      expect(emittedEvents.length).toBeGreaterThan(0)
      const exitEvent = emittedEvents.find((e) => e.type === 'GEOFENCE_EVENT')
      expect(exitEvent?.payload.status).toBe('exited')
      expect(exitEvent?.payload.zoneId).toBe('zone-1')
    })

    it('should not emit event when agent stays in same zone', async () => {
      const agentId = 'agent-3'

      // First check: inside zone
      await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, testZones)
      emittedEvents = [] // Clear

      // Second check: still inside zone (slightly different position)
      await service.checkLocationAgainstZones(agentId, 40.7130, -74.006, testZones)

      // Should NOT emit event (no transition)
      const transitionEvents = emittedEvents.filter((e) => e.type === 'GEOFENCE_EVENT')
      expect(transitionEvents.length).toBe(0)
    })

    it('should handle multiple zones simultaneously', async () => {
      const agentId = 'agent-4'

      // Check multiple zones from single location
      const transitions = await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, testZones)

      expect(transitions.length).toBe(2)
      expect(transitions[0].zoneId).toBe('zone-1')
      expect(transitions[1].zoneId).toBe('zone-2')
    })

    it('should include distance in transition events', async () => {
      const agentId = 'agent-5'

      const transitions = await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, [
        testZones[0]
      ])

      expect(transitions[0]).toHaveProperty('distance')
      expect(typeof transitions[0].distance).toBe('number')
      expect(transitions[0].distance).toBeGreaterThanOrEqual(0)
    })

    it('should maintain separate state for different agents', async () => {
      // Agent 1: inside zone
      await service.checkLocationAgainstZones('agent-1', 40.7128, -74.006, testZones)

      // Agent 2: outside zone
      await service.checkLocationAgainstZones('agent-2', 40.8128, -74.006, testZones)

      // Agent 1: should still be tracked as inside
      const state1 = service.getAgentState('agent-1')
      expect(state1).toBeDefined()
      expect(state1?.['zone-1']?.wasInside).toBe(true)

      // Agent 2: should be tracked as outside
      const state2 = service.getAgentState('agent-2')
      expect(state2?.['zone-1']?.wasInside).toBe(false)
    })

    it('should emit events with correct structure', async () => {
      const agentId = 'agent-6'

      // Move from outside to inside
      await service.checkLocationAgainstZones(agentId, 40.8128, -74.006, testZones)
      emittedEvents = []

      await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, testZones)

      const event = emittedEvents[0]
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('type', 'GEOFENCE_EVENT')
      expect(event).toHaveProperty('timestamp')
      expect(event).toHaveProperty('agentId', agentId)
      expect(event).toHaveProperty('payload')
      expect(event.payload).toHaveProperty('zoneId')
      expect(event.payload).toHaveProperty('zoneName')
      expect(event.payload).toHaveProperty('status')
      expect(event.payload).toHaveProperty('distance')
      expect(event).toHaveProperty('metadata')
      expect(event.metadata).toHaveProperty('syncState', 'PENDING')
    })
  })

  describe('getZoneStatus', () => {
    it('should return current zone status', async () => {
      const status = await service.getZoneStatus('agent-1', testZones[0], 40.7128, -74.006)

      expect(status).toHaveProperty('isInside')
      expect(status).toHaveProperty('distance')
      expect(status).toHaveProperty('lastCheck')
      expect(typeof status.isInside).toBe('boolean')
      expect(typeof status.distance).toBe('number')
      expect(typeof status.lastCheck).toBe('number')
    })

    it('should return true when inside zone', async () => {
      const status = await service.getZoneStatus('agent-1', testZones[0], 40.7128, -74.006)
      expect(status.isInside).toBe(true)
    })

    it('should return false when outside zone', async () => {
      const status = await service.getZoneStatus('agent-1', testZones[0], 40.8128, -74.006)
      expect(status.isInside).toBe(false)
    })

    it('should include distance measurement', async () => {
      const status = await service.getZoneStatus('agent-1', testZones[0], 40.7128, -74.006)
      expect(status.distance).toBeGreaterThanOrEqual(0)
    })
  })

  describe('clearAgentState', () => {
    it('should remove agent from tracking', async () => {
      const agentId = 'agent-1'

      // Add agent
      await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, testZones)
      expect(service.getAgentState(agentId)).toBeDefined()

      // Clear agent
      service.clearAgentState(agentId)
      expect(service.getAgentState(agentId)).toBeUndefined()
    })
  })

  describe('getActiveAgents', () => {
    it('should return array of tracked agent IDs', async () => {
      await service.checkLocationAgainstZones('agent-1', 40.7128, -74.006, testZones)
      await service.checkLocationAgainstZones('agent-2', 40.7128, -74.006, testZones)

      const agents = service.getActiveAgents()
      expect(Array.isArray(agents)).toBe(true)
      expect(agents).toContain('agent-1')
      expect(agents).toContain('agent-2')
    })

    it('should return empty array when no agents tracked', () => {
      const agents = service.getActiveAgents()
      expect(agents).toEqual([])
    })
  })

  describe('getAgentState', () => {
    it('should return agent zone state', async () => {
      const agentId = 'agent-1'
      await service.checkLocationAgainstZones(agentId, 40.7128, -74.006, testZones)

      const state = service.getAgentState(agentId)
      expect(state).toBeDefined()
      expect(state).toHaveProperty('zone-1')
      expect(state?.['zone-1']).toHaveProperty('wasInside')
      expect(state?.['zone-1']).toHaveProperty('lastCheckTime')
    })

    it('should return undefined for unknown agent', () => {
      const state = service.getAgentState('unknown-agent')
      expect(state).toBeUndefined()
    })
  })
})
