// STUB - replace with real implementation later

export interface Agent {
  id: string
  name: string
  phone: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: Date
}

export interface Scan {
  id: string
  agentId: string
  qrCode: string
  parcelId?: string
  timestamp: Date
  location?: { lat: number; lng: number }
}

export interface Location {
  id: string
  agentId: string
  lat: number
  lng: number
  accuracy: number
  timestamp: Date
}

export interface Detection {
  id: string
  scanId: string
  label: string
  confidence: number
  bbox: string
  timestamp: Date
}

export interface Delivery {
  id: string
  scanId: string
  status: string
  deliveredAt?: Date
  signature?: string
}

export interface Payment {
  id: string
  deliveryId: string
  amount: number
  method: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  transactionId?: string
  timestamp: Date
}

export interface OTP {
  id: string
  phone: string
  code: string
  verified: boolean
  expiresAt: Date
  createdAt: Date
}

export interface Message {
  id: string
  type: 'SMS' | 'WHATSAPP'
  recipient: string
  content: string
  status: 'SENT' | 'FAILED'
  timestamp: Date
}

export interface SyncQueue {
  id: string
  eventId: string
  eventType: string
  payload: string
  status: 'PENDING' | 'SYNCED' | 'FAILED'
  attempts: number
  lastAttempt?: Date
  createdAt: Date
}

export interface GeoZone {
  id: string
  name: string
  centerLat: number
  centerLng: number
  radiusMeters: number
  createdAt: Date
}

export interface GeofenceAlert {
  id: string
  zoneId: string
  agentId: string
  eventType: 'ENTER' | 'EXIT'
  timestamp: Date
}
