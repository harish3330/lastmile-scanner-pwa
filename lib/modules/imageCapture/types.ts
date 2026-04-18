// ============================================================
//  lib/modules/imageCapture/types.ts — ISSUE #5
//  TypeScript interfaces for image capture module
// ============================================================

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

export interface CaptureOptions {
  facingMode?: 'user' | 'environment'
  compression?: CompressionOptions
  includeLocation?: boolean
}

export interface DeviceCamera {
  stream: MediaStream
  track: MediaStreamTrack
  active: boolean
}
