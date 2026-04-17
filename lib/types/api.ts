// STUB - replace with real implementation later

export interface ScanRequest {
  agentId: string
  qrCode: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface ScanResponse {
  id: string
  parcelId?: string
  status: 'success' | 'error'
  message: string
}

export interface LocationRequest {
  agentId: string
  lat: number
  lng: number
  accuracy: number
}

export interface LocationResponse {
  id: string
  status: 'logged' | 'error'
}

export interface DeliveryRequest {
  scanId: string
  deliveryStatus: string
}

export interface DeliveryResponse {
  id: string
  status: 'success' | 'error'
}

export interface PaymentRequest {
  deliveryId: string
  amount: number
  method: string
}

export interface PaymentResponse {
  id: string
  transactionId: string
  status: 'success' | 'failed'
}

export interface Parcel {
  id: string
  class: string
  confidence: number
  bbox: [number, number, number, number] // [x1, y1, x2, y2] (0-1 normalized)
}

export interface DetectRequest {
  imageBase64: string // Base64 encoded image
  agentId: string
  timestamp: number
  location?: { lat: number; lng: number }
  minConfidence?: number // Optional: confidence threshold (default 0.5)
}

export interface DetectResponse {
  parcelCount: number
  confidence: number // Average confidence of detections
  detections: Parcel[]
  inferenceTime: number // ML inference time in milliseconds
  timestamp: number
}

export interface SyncRequest {
  events: any[]
}

export interface SyncResponse {
  synced: number
  failed: number
  status: 'success' | 'partial' | 'error'
}

// Geofence API
export interface GeofenceCheckRequest {
  agentId: string
  latitude: number
  longitude: number
  timestamp: number
}

export interface GeofenceCheckResponse {
  zoneId: string
  zoneName: string
  status: 'entered' | 'exited' | 'unknown'
  distance: number
  alert: boolean
  timestamp: number
}

export interface GeofenceZone {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // meters
  alertThreshold?: number // distance in meters to trigger alert
}

export interface GeofenceCheckResult {
  zoneId: string
  zoneName: string
  status: 'entered' | 'exited'
  distance: number
  isInside: boolean
  timestamp: number
}

export interface OTPRequest {
  phone: string
}

export interface OTPResponse {
  status: 'sent' | 'error'
  message: string
}

export interface VerifyOTPRequest {
  phone: string
  code: string
}

export interface VerifyOTPResponse {
  status: 'verified' | 'invalid'
  token?: string
}

export interface WhatsAppRequest {
  message: string
  recipient: string
}

export interface WhatsAppResponse {
  status: 'sent' | 'error'
  messageId?: string
}
