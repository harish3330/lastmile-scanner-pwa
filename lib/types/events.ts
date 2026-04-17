// STUB - replace with real implementation later

export interface AppEvent {
  id: string
  type: string
  timestamp: number
  agentId: string
  payload: Record<string, any>
  metadata: {
    syncState: 'PENDING' | 'SYNCED' | 'FAILED'
    attempt: number
  }
}

export interface ScanEvent extends AppEvent {
  type: 'SCAN_EVENT'
  payload: { qrCode: string; timestamp: number }
}

export interface LocationEvent extends AppEvent {
  type: 'LOCATION_EVENT'
  payload: { lat: number; lng: number; accuracy: number }
}

export interface DetectionEvent extends AppEvent {
  type: 'DETECTION_EVENT'
  payload: { label: string; confidence: number }
}

export interface DeliveryEvent extends AppEvent {
  type: 'DELIVERY_EVENT'
  payload: { deliveryId: string; status: string }
}

export interface PaymentEvent extends AppEvent {
  type: 'PAYMENT_EVENT'
  payload: { amount: number; method: string; status: string }
}

export interface GeofenceEvent extends AppEvent {
  type: 'GEOFENCE_EVENT'
  payload: { zoneId: string; entering: boolean }
}

export interface ImageCaptureEvent extends AppEvent {
  type: 'IMAGE_CAPTURE_EVENT'
  payload: { imagePath: string; timestamp: number }
}

export interface OTPEvent extends AppEvent {
  type: 'OTP_EVENT'
  payload: { phone: string; code: string }
}

export interface WhatsAppEvent extends AppEvent {
  type: 'WHATSAPP_EVENT'
  payload: { message: string; recipient: string }
}

export interface SyncEvent extends AppEvent {
  type: 'SYNC_EVENT'
  payload: { eventsCount: number; duration: number }
}
