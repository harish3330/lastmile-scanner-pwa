// STUB - replace with real implementation later
export type EventPayload = any;
export type ApiResponse = any;
export type DbRecord = any;

// Export all types from submodules
export * from './serviceWorker';
export * from './events';
export * from './api';
export * from './db';

// Geofence-specific types
export interface GeofenceResult {
  zoneId: string
  zoneName: string
  status: 'entered' | 'exited'
  distance: number
  isInside: boolean
  latitude: number
  longitude: number
  timestamp: number
}

export interface ZoneBoundary {
  center: {
    latitude: number
    longitude: number
  }
  radiusMeters: number
  alertThreshold?: number
}

export interface GeofenceCheckRequest {
  latitude: number
  longitude: number
  zones: Array<{ id: string; name: string; latitude: number; longitude: number; radius: number }>
}

export interface Agent {
  id: string
  name: string
  phoneNumber: string
  status: 'active' | 'offline' | 'inactive'
  lastLocation?: { lat: number; lng: number }
  createdAt: Date
  updatedAt: Date
}
