// ============================================================
//  lib/modules/imageCapture/captureManager.ts — ISSUE #5
//  Image capture from device camera with compression
// ============================================================

import { eventBus } from '@/lib/events/eventBus'
import { ImageCaptureEvent } from '@/lib/types/events'
import type { CaptureResult } from '@/lib/types'
import { CaptureOptions, DeviceCamera } from './types'
import { ImageCompressor } from './compression'
import { v4 as uuid } from 'uuid'

export class ImageCaptureManager {
  private camera: DeviceCamera | null = null
  private isCapturing = false

  /**
   * Request camera access and initialize
   */
  async initializeCamera(options: CaptureOptions = {}): Promise<void> {
    try {
      const facingMode = options.facingMode || 'environment'

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      const track = stream.getVideoTracks()[0]

      this.camera = {
        stream,
        track: track as MediaStreamTrack,
        active: true,
      }

      console.log('[ImageCapture] Camera initialized')
    } catch (error) {
      console.error('[ImageCapture] Failed to initialize camera:', error)
      throw error
    }
  }

  /**
   * Capture image from camera
   */
  async captureImage(options: CaptureOptions = {}): Promise<CaptureResult> {
    if (!this.camera || !this.camera.active) {
      throw new Error('Camera not initialized. Call initializeCamera first.')
    }

    try {
      this.isCapturing = true

      // Get current location if requested
      const location = options.includeLocation ? await this.getCurrentLocation() : { lat: 0, lng: 0 }

      // Create video element and capture frame
      const video = document.createElement('video')
      video.srcObject = this.camera.stream
      video.play()

      // Wait for video to load
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Create canvas and capture
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      ctx.drawImage(video, 0, 0)

      // Convert to base64
      const imageBase64 = canvas.toDataURL('image/jpeg')

      // Compress image
      const compressionOptions = options.compression || {}
      const { compressed, sizeBytes } = await ImageCompressor.compress(
        imageBase64,
        compressionOptions
      )

      // Create result
      const result: CaptureResult = {
        id: uuid(),
        imageBase64: compressed,
        mimeType: 'image/jpeg',
        sizeBytes,
        metadata: {
          latitude: location.lat,
          longitude: location.lng,
          timestamp: Date.now(),
        },
      }

      console.log('[ImageCapture] Image captured successfully:', result.id)

      // Emit event
      this.emitCaptureEvent(result)

      this.isCapturing = false
      return result
    } catch (error) {
      console.error('[ImageCapture] Error capturing image:', error)
      this.isCapturing = false
      throw error
    }
  }

  /**
   * Emit IMAGE_CAPTURE_EVENT
   */
  private emitCaptureEvent(result: CaptureResult): void {
    const event: ImageCaptureEvent = {
      id: uuid(),
      type: 'IMAGE_CAPTURE_EVENT',
      timestamp: Date.now(),
      agentId: this.getAgentId(),
      payload: {
        imageBase64: result.imageBase64,
        mimeType: result.mimeType,
        size: result.sizeBytes,
        metadata: result.metadata,
      },
      metadata: {
        location: {
          lat: result.metadata.latitude,
          lng: result.metadata.longitude,
        },
        syncState: 'PENDING',
        attempt: 0,
      },
    }

    eventBus.emit(event)
    console.log('[ImageCapture] Event emitted:', event.type)
  }

  /**
   * Get current device location
   */
  private async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
    } catch (error) {
      console.warn('[ImageCapture] Failed to get location:', error)
      return { lat: 0, lng: 0 }
    }
  }

  /**
   * Get agent ID from localStorage
   */
  private getAgentId(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agentId') || 'unknown'
    }
    return 'unknown'
  }

  /**
   * Stop camera stream
   */
  stopCamera(): void {
    if (this.camera) {
      this.camera.track.stop()
      this.camera.stream.getTracks().forEach((track) => track.stop())
      this.camera.active = false
      console.log('[ImageCapture] Camera stopped')
    }
  }

  /**
   * Check if camera is currently active
   */
  isCameraActive(): boolean {
    return this.camera?.active || false
  }

  /**
   * Check if currently capturing
   */
  isCapturingImage(): boolean {
    return this.isCapturing
  }
}

// Export singleton instance
export const imageCaptureManager = new ImageCaptureManager()
