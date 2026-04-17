/**
 * ISSUE #4 - QR/Barcode Scanner Types
 * Shared type definitions for the scanner module
 */

export interface ScanResult {
  format: 'QR_CODE' | 'BARCODE' | 'UPC'
  value: string
  timestamp: number
  rawData?: string
}

export interface CameraConfig {
  facingMode: 'environment' | 'user'
  width?: number
  height?: number
  frameRate?: number
}

export interface ScannerState {
  isActive: boolean
  isPermissionGranted: boolean
  lastScan?: ScanResult
  error?: string
  frameCount: number
}

export interface ScannerOptions {
  cameraConfig?: CameraConfig
  debounceMs?: number
  autoStop?: boolean
}

export interface CameraPermissionStatus {
  state: 'granted' | 'denied' | 'prompt'
  reason?: string
}

export interface ScanEvent {
  id: string
  qrCode: string
  barcode?: string
  format: 'QR_CODE' | 'BARCODE' | 'UPC'
  timestamp: number
  agentId: string
  location?: { lat: number; lng: number }
  syncState: 'PENDING' | 'SYNCED' | 'FAILED'
}
