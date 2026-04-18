import { eventBus } from '@/lib/events/eventBus'
import { syncManager } from '@/lib/modules/sync'
import type { LocationEvent } from '@/lib/types'
import type { GeolocationTrackerConfig } from './types'

const DEFAULT_CONFIG: Required<Pick<GeolocationTrackerConfig, 'watchOptions' | 'minDistanceMeters'>> = {
  watchOptions: {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 10000
  },
  minDistanceMeters: 5
}

export class GeolocationTracker {
  private watchId: number | null = null
  private lastPosition: GeolocationPosition | null = null
  private config: Required<GeolocationTrackerConfig>

  constructor(config: GeolocationTrackerConfig = {}) {
    this.config = {
      agentId: config.agentId || 'unknown',
      watchOptions: config.watchOptions || DEFAULT_CONFIG.watchOptions,
      minDistanceMeters: config.minDistanceMeters ?? DEFAULT_CONFIG.minDistanceMeters
    }
  }

  setAgentId(agentId: string) {
    this.config.agentId = agentId
  }

  start(): boolean {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn('[GeolocationTracker] Geolocation is not supported')
      return false
    }

    if (this.watchId !== null) {
      return true
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position),
      (error) => this.handleError(error),
      this.config.watchOptions
    )

    return this.watchId !== null
  }

  stop(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  isTracking(): boolean {
    return this.watchId !== null
  }

  private handlePosition(position: GeolocationPosition): void {
    if (!this.hasMovedEnough(position)) {
      return
    }

    this.lastPosition = position

    const event: LocationEvent = {
      id: `location-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'LOCATION_EVENT',
      timestamp: Date.now(),
      agentId: this.config.agentId,
      payload: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      },
      metadata: {
        syncState: 'PENDING',
        attempt: 0
      }
    }

    eventBus.emit(event)
    syncManager.queue(event).catch((error) => {
      console.error('[GeolocationTracker] Failed to queue location event', error)
    })
  }

  private handleError(error: GeolocationPositionError): void {
    console.error('[GeolocationTracker] Geolocation error', error)
  }

  private hasMovedEnough(position: GeolocationPosition): boolean {
    if (!this.lastPosition) {
      return true
    }

    const distance = this.calculateDistance(
      this.lastPosition.coords.latitude,
      this.lastPosition.coords.longitude,
      position.coords.latitude,
      position.coords.longitude
    )

    return distance >= this.config.minDistanceMeters
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}
