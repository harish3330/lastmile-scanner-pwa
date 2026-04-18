// ============================================================
//  lib/modules/imageCapture/compression.ts — ISSUE #5
//  Image compression and optimization utilities
// ============================================================

import { CompressionOptions } from './types'

export class ImageCompressor {
  static readonly DEFAULT_MAX_WIDTH = 1280
  static readonly DEFAULT_MAX_HEIGHT = 720
  static readonly DEFAULT_QUALITY = 0.8
  static readonly DEFAULT_MAX_SIZE = 500 * 1024 // 500KB

  /**
   * Compress image using canvas
   * @param imageBase64 Base64 encoded image
   * @param options Compression options
   * @returns Compressed base64 image and final size
   */
  static async compress(
    imageBase64: string,
    options: CompressionOptions = {}
  ): Promise<{ compressed: string; sizeBytes: number }> {
    const maxWidth = options.maxWidth || this.DEFAULT_MAX_WIDTH
    const maxHeight = options.maxHeight || this.DEFAULT_MAX_HEIGHT
    const quality = Math.min(1, Math.max(0.1, options.quality || this.DEFAULT_QUALITY))
    const maxSizeBytes = options.maxSizeBytes || this.DEFAULT_MAX_SIZE

    try {
      // Convert base64 to image
      const img = new Image()
      img.src = imageBase64

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Create canvas and draw image
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // Calculate scaled dimensions
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        if (width > height) {
          width = maxWidth
          height = Math.round(width / aspectRatio)
        } else {
          height = maxHeight
          width = Math.round(height * aspectRatio)
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob and check size
      let currentQuality = quality
      let compressed = canvas.toDataURL('image/jpeg', currentQuality)

      // Reduce quality if too large
      while (compressed.length > maxSizeBytes && currentQuality > 0.1) {
        currentQuality -= 0.1
        compressed = canvas.toDataURL('image/jpeg', currentQuality)
      }

      const sizeBytes = this.base64ToBytes(compressed).length

      console.log(`[Compression] Original size: ${imageBase64.length} bytes, Compressed: ${sizeBytes} bytes, Quality: ${Math.round(currentQuality * 100)}%`)

      return { compressed, sizeBytes }
    } catch (error) {
      console.error('[Compression] Error compressing image:', error)
      throw error
    }
  }

  /**
   * Calculate base64 string size in bytes
   */
  static base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64.split(',')[1] || base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  /**
   * Get estimated size of base64 string in bytes
   */
  static estimateBase64Size(base64: string): number {
    // Base64 string length / 4 * 3 gives approximate byte size
    // (accounting for padding and overhead)
    const cleanBase64 = base64.split(',')[1] || base64
    return Math.ceil((cleanBase64.length * 3) / 4)
  }
}
