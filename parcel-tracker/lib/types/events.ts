// ============================================================
//  lib/types/events.ts — SINGLE SOURCE OF TRUTH
//  Mandated by TEAM-ARCHITECTURE.md
// ============================================================

// Event categories
export type EventType =
  | 'SCAN_EVENT'
  | 'LOCATION_EVENT'
  | 'DELIVERY_EVENT'
  | 'PAYMENT_EVENT'
  | 'DETECTION_EVENT'
  | 'GEOFENCE_EVENT'
  | 'IMAGE_CAPTURE_EVENT'
  | 'OTP_EVENT'
  | 'WHATSAPP_EVENT'
  | 'SYNC_EVENT'

// Sync states
export type SyncState = 'PENDING' | 'SYNCED' | 'FAILED' | 'RETRYING'

// Base event interface (all events extend this)
export interface AppEvent {
  id: string // UUID
  type: EventType
  timestamp: number // milliseconds since epoch
  agentId: string
  payload: Record<string, any>
  metadata: {
    location?: { lat: number; lng: number }
    syncState: SyncState
    attempt: number
    error?: string
  }
}

// Specific event types
export interface ScanEvent extends AppEvent {
  type: 'SCAN_EVENT'
  payload: {
    qrCode: string
    barcode?: string
    timestamp: number
  }
}

export interface LocationEvent extends AppEvent {
  type: 'LOCATION_EVENT'
  payload: {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: number
  }
}

export interface DeliveryEvent extends AppEvent {
  type: 'DELIVERY_EVENT'
  payload: {
    deliveryId: string
    status: 'started' | 'in_progress' | 'completed'
    imageProof?: string // base64
    timestamp: number
  }
}

export interface PaymentEvent extends AppEvent {
  type: 'PAYMENT_EVENT'
  payload: {
    transactionId: string
    expectedAmount: number
    collectedAmount: number
    paymentMode: 'cash' | 'card' | 'upi'
    status: 'matched' | 'mismatch'
    timestamp: number
  }
}

export interface DetectionEvent extends AppEvent {
  type: 'DETECTION_EVENT'
  payload: {
    parcelCount: number
    confidence: number
    imageBase64: string
    timestamp: number
  }
}

export interface GeofenceEvent extends AppEvent {
  type: 'GEOFENCE_EVENT'
  payload: {
    zoneId: string
    zoneName: string
    status: 'entered' | 'exited'
    distance: number
    timestamp: number
  }
}

export interface ImageCaptureEvent extends AppEvent {
  type: 'IMAGE_CAPTURE_EVENT'
  payload: {
    imageBase64: string
    mimeType: string
    size: number // bytes after compression
    metadata: {
      latitude: number
      longitude: number
      timestamp: number
    }
  }
}

export interface OTPEvent extends AppEvent {
  type: 'OTP_EVENT'
  payload: {
    phoneNumber: string
    otpCode: string
    verified: boolean
    timestamp: number
  }
}

export interface WhatsappEvent extends AppEvent {
  type: 'WHATSAPP_EVENT'
  payload: {
    phoneNumber: string
    messageType: 'notification' | 'alert' | 'confirmation'
    content: string
    timestamp: number
  }
}

export interface SyncEvent extends AppEvent {
  type: 'SYNC_EVENT'
  payload: {
    totalEvents: number
    syncedEvents: number
    failedEvents: number
    timestamp: number
  }
}
