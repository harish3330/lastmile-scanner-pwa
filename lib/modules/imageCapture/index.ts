// ============================================================
//  lib/modules/imageCapture/index.ts — ISSUE #5
//  Central export file for image capture module
// ============================================================

export { ImageCaptureManager, imageCaptureManager } from './captureManager'
export { ImageCompressor } from './compression'
export type { CaptureResult } from '@/lib/types'
export type { CompressionOptions, CaptureOptions, DeviceCamera } from './types'
