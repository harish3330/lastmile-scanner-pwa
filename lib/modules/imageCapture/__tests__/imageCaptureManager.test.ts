// ============================================================
//  lib/modules/imageCapture/__tests__/imageCaptureManager.test.ts
//  ISSUE #5 - Image Capture Tests
// ============================================================

import { ImageCaptureManager } from '../captureManager'
import { ImageCompressor } from '../compression'
import { eventBus } from '@/lib/events/eventBus'
import { ImageCaptureEvent } from '@/lib/types/events'

describe('ImageCaptureManager', () => {
  let manager: ImageCaptureManager
  let emitSpy: jest.SpyInstance

  beforeEach(() => {
    manager = new ImageCaptureManager()
    emitSpy = jest.spyOn(eventBus, 'emit')
  })

  afterEach(() => {
    emitSpy.mockRestore()
    if (manager.isCameraActive()) {
      manager.stopCamera()
    }
  })

  it('should emit IMAGE_CAPTURE_EVENT on capture', async () => {
    // Mock camera initialization
    const mockStream = {
      getTracks: jest.fn(() => []),
    } as any

    navigator.mediaDevices.getUserMedia = jest.fn(() =>
      Promise.resolve(mockStream)
    )

    await manager.initializeCamera()
    expect(manager.isCameraActive()).toBe(true)
  })

  it('should throw error if camera not initialized', async () => {
    const newManager = new ImageCaptureManager()
    await expect(newManager.captureImage()).rejects.toThrow(
      'Camera not initialized'
    )
  })

  it('should stop camera stream', async () => {
    const mockTrack = { stop: jest.fn() } as any
    const mockStream = {
      getTracks: jest.fn(() => [mockTrack]),
    } as any

    navigator.mediaDevices.getUserMedia = jest.fn(() =>
      Promise.resolve(mockStream)
    )

    await manager.initializeCamera()
    manager.stopCamera()

    expect(mockTrack.stop).toHaveBeenCalled()
    expect(manager.isCameraActive()).toBe(false)
  })
})

describe('ImageCompressor', () => {
  const mockBase64Image =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==' // Small mock JPEG

  it('should compress image and return size', async () => {
    const result = await ImageCompressor.compress(mockBase64Image, {
      quality: 0.8,
    })

    expect(result.compressed).toBeDefined()
    expect(result.sizeBytes).toBeGreaterThan(0)
  })

  it('should respect max size constraint', async () => {
    const result = await ImageCompressor.compress(mockBase64Image, {
      maxSizeBytes: 10000, // 10KB limit
      quality: 0.9,
    })

    expect(result.sizeBytes).toBeLessThanOrEqual(10000)
  })

  it('should estimate base64 size', () => {
    const size = ImageCompressor.estimateBase64Size(mockBase64Image)
    expect(size).toBeGreaterThan(0)
  })

  it('should handle quality range 0.1 to 1', async () => {
    const lowQuality = await ImageCompressor.compress(mockBase64Image, {
      quality: 0.1,
    })
    const highQuality = await ImageCompressor.compress(mockBase64Image, {
      quality: 0.9,
    })

    expect(lowQuality.sizeBytes).toBeLessThan(highQuality.sizeBytes)
  })
})
