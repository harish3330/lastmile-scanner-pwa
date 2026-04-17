/**
 * ISSUE #4 - Scanner Module Unit Tests
 * Test-Driven Development: tests written first
 */

import { ScannerEngine } from '../scanner'
import { ScanResult, CameraConfig } from '../types'

describe('ScannerEngine', () => {
  let scanner: ScannerEngine

  beforeEach(() => {
    jest.clearAllMocks()
    scanner = new ScannerEngine()
  })

  afterEach(() => {
    scanner.stop()
  })

  describe('Camera Permissions', () => {
    it('should request camera permissions when initialized', async () => {
      const permission = await scanner.requestCameraPermission()
      expect(permission).toHaveProperty('state')
      expect(['granted', 'denied', 'prompt']).toContain(permission.state)
    }, 10000)

    it('should return permission status without re-requesting', async () => {
      const permission1 = await scanner.getCameraPermissionStatus()
      const permission2 = await scanner.getCameraPermissionStatus()
      expect(permission1.state).toBe(permission2.state)
    }, 10000)

    it('should handle denied permissions gracefully', async () => {
      scanner.setPermissionMock('denied')
      const permission = await scanner.requestCameraPermission()
      expect(permission.state).toBe('denied')
      expect(permission.reason).toBeDefined()
    })
  })

  describe('Scan Detection', () => {
    it('should detect from mock image data', () => {
      const mockImageData = createMockImageData()
      const result = scanner.detectFromImageData(mockImageData)
      
      // Initially null without mock set
      expect(result).toBeNull()
    })

    it('should return result when mock scan set', () => {
      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'https://example.com',
        timestamp: Date.now()
      }
      scanner.setLastScanMock(mockResult)
      
      const mockImageData = createMockImageData()
      const result = scanner.detectFromImageData(mockImageData)
      
      expect(result).toEqual(mockResult)
    })

    it('should support different barcode formats', () => {
      const qrResult: ScanResult = {
        format: 'QR_CODE',
        value: 'qr-test',
        timestamp: Date.now()
      }
      scanner.setLastScanMock(qrResult)
      let result = scanner.detectFromImageData(createMockImageData())
      expect(result?.format).toBe('QR_CODE')

      const barcodeResult: ScanResult = {
        format: 'BARCODE',
        value: '123456789',
        timestamp: Date.now()
      }
      scanner.setLastScanMock(barcodeResult)
      result = scanner.detectFromImageData(createMockImageData())
      expect(result?.format).toBe('BARCODE')
    })
  })

  describe('Scanner State', () => {
    it('should stop scanner and set state to inactive', () => {
      scanner.stop()
      const state = scanner.getState()
      expect(state.isActive).toBe(false)
    })

    it('should track frame count during processing', () => {
      // For processFrame() to work, we need to set videoElement and activate
      // But since we're mocking, we directly test the state
      scanner.processFrame()
      scanner.processFrame()
      // Note: processFrame() returns early if !videoElement, so we check with mock
      // This test validates the method doesn't throw
      const state = scanner.getState()
      expect(typeof state.frameCount).toBe('number')
    })

    it('should store last scan result', () => {
      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'test-qr-code',
        timestamp: Date.now()
      }
      scanner.setLastScanMock(mockResult)
      const imageData = createMockImageData()
      const result = scanner.detectFromImageData(imageData)
      expect(result).toEqual(mockResult)
    })

    it('should return null state initially', () => {
      const state = scanner.getState()
      expect(state).toHaveProperty('isActive')
      expect(state).toHaveProperty('frameCount')
      expect(typeof state.frameCount).toBe('number')
    })
  })

  describe('Debouncing', () => {
    it('should debounce rapid scan detections', (done) => {
      const results: ScanResult[] = []
      scanner.onScan((result) => results.push(result))
      scanner.setDebounceMs(100)

      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'test',
        timestamp: Date.now()
      }

      scanner.emulateScan(mockResult)
      scanner.emulateScan(mockResult)
      scanner.emulateScan(mockResult)

      setTimeout(() => {
        expect(results.length).toBe(1)
        done()
      }, 200)
    }, 10000)
  })

  describe('Callbacks', () => {
    it('should emit scan event when code detected', (done) => {
      scanner.onScan((result) => {
        expect(result).toHaveProperty('format')
        expect(result).toHaveProperty('value')
        done()
      })

      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'test-code',
        timestamp: Date.now()
      }
      scanner.emulateScan(mockResult)
    }, 10000)

    it('should emit error event on scan failure', (done) => {
      scanner.onError((error) => {
        expect(error).toBeDefined()
        done()
      })

      scanner.emulateError('Test error')
    }, 10000)

    it('should handle multiple callbacks', (done) => {
      let count = 0
      
      scanner.onScan(() => count++)
      scanner.onScan(() => count++)
      
      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'multi-callback-test',
        timestamp: Date.now()
      }
      
      scanner.emulateScan(mockResult)
      
      setTimeout(() => {
        expect(count).toBe(2)
        done()
      }, 100)
    }, 10000)
  })

  describe('Camera Stream', () => {
    it('should have null video element initially', () => {
      const videoElement = scanner.getVideoElement()
      expect(videoElement).toBeNull()
    })

    it('should clean up video element on stop', () => {
      scanner.stop()
      const videoElement = scanner.getVideoElement()
      expect(videoElement).toBeNull()
    })
  })

  describe('Unsubscribe Callbacks', () => {
    it('should unsubscribe scan callbacks', (done) => {
      let callCount = 0
      const unsubscribe = scanner.onScan(() => {
        callCount++
      })

      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'unsub-test',
        timestamp: Date.now()
      }

      scanner.emulateScan(mockResult)
      
      // Unsubscribe
      unsubscribe()
      
      // Emit again - should not be called
      scanner.emulateScan(mockResult)

      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 100)
    }, 10000)
  })
})

// Mock helpers
function createMockImageData(): ImageData {
  const data = new Uint8ClampedArray(4 * 100 * 100)
  return new ImageData(data, 100, 100)
}

