// ============================================================
//  lib/modules/imageCapture/types.ts — ISSUE #5
//  TypeScript interfaces for image capture module
// ============================================================

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

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1
  maxSizeBytes?: number // Default: 500KB
}

export interface CaptureOptions {
  facingMode?: 'user' | 'environment'
  compression?: CompressionOptions
  includeLocation?: boolean
}

export interface DeviceCamera {
  stream: MediaStream
  track: MediaStreamVideoTrack
  active: boolean
}
