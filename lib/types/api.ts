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

export interface DetectRequest {
  image: string
  confidence?: number
}

export interface DetectResponse {
  detections: Array<{
    label: string
    confidence: number
    bbox: [number, number, number, number]
  }>
}

export interface SyncRequest {
  events: any[]
}

export interface SyncResponse {
  synced: number
  failed: number
  status: 'success' | 'partial' | 'error'
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
