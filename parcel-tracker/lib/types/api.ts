// ============================================================
//  lib/types/api.ts — API CONTRACTS
//  Mandated by TEAM-ARCHITECTURE.md
// ============================================================

import { AppEvent, Parcel } from './index'

// SCAN API
export interface ScanRequest {
  qrCode: string
  agentId: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface ScanResponse {
  scanId: string
  qrCode: string
  decoded: any
  timestamp: number
}

// LOCATION API
export interface LocationRequest {
  agentId: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface LocationResponse {
  locationId: string
  agentId: string
  latitude: number
  longitude: number
  timestamp: number
}

// DELIVERY API
export interface DeliveryRequest {
  deliveryId: string
  agentId: string
  status: 'started' | 'in_progress' | 'completed'
  imageProof?: string // base64
  timestamp: number
}

export interface DeliveryResponse {
  deliveryId: string
  status: string
  proofId?: string
  timestamp: number
}

// PAYMENT API
export interface PaymentRequest {
  transactionId: string
  agentId: string
  expectedAmount: number
  collectedAmount: number
  paymentMode: 'cash' | 'card' | 'upi'
  timestamp: number
}

export interface PaymentResponse {
  transactionId: string
  status: 'matched' | 'mismatch'
  discrepancy: number
  timestamp: number
}

// DETECT API (ISSUE #9)
export interface DetectRequest {
  imageBase64: string
  agentId: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface DetectResponse {
  parcelCount: number
  confidence: number
  detections: Parcel[]
  inferenceTime: number
  timestamp: number
}

// SYNC API
export interface SyncRequest {
  events: AppEvent[]
  agentId: string
}

export interface SyncResponse {
  synced: number
  failed: number
  errors: { eventId: string; error: string }[]
}

// OTP API
export interface OTPRequest {
  phoneNumber: string
  action: 'send' | 'verify'
  otp?: string
}

export interface OTPResponse {
  phoneNumber: string
  verified: boolean
  message: string
}

// WHATSAPP API
export interface WhatsappRequest {
  phoneNumber: string
  messageType: string
  content: string
}

export interface WhatsappResponse {
  messageId: string
  status: 'sent' | 'failed'
}
