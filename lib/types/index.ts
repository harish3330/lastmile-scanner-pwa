// ============================================================
//  lib/types/index.ts — CORE DATA TYPES
//  Mandated by TEAM-ARCHITECTURE.md
// ============================================================

export * from './events'

export interface Agent {
  id: string // UUID
  name: string
  phoneNumber: string
  status: 'active' | 'offline' | 'inactive'
  lastLocation?: { lat: number; lng: number }
  createdAt: Date
  updatedAt: Date
}

export interface Parcel {
  id: string
  bbox: [number, number, number, number] // [x1, y1, x2, y2] normalized 0-1
  confidence: number
  label: string
}

export interface PageProps {
  title: string
  description?: string
  isProtected?: boolean
}

export interface CaptureResult {
  id: string
  imageBase64: string
  mimeType: string
  sizeBytes: number
  metadata: {
    latitude: number
    longitude: number
    timestamp: number
  }
}

export interface DetectionResult {
  id: string
  agentId: string
  parcelCount: number
  confidence: number
  detections: Parcel[]
  imageHash: string
  createdAt: Date
}

export interface GeoZone {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // meters
  alertThreshold: number
}

export interface CashTransaction {
  id: string
  agentId: string
  expectedAmount: number
  collectedAmount: number
  paymentMode: 'cash' | 'card' | 'upi'
  status: 'matched' | 'mismatch'
  discrepancy: number
  createdAt: Date
}
