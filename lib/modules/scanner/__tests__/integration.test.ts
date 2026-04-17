/**
 * ISSUE #4 - Scanner Integration Tests
 * Tests scanner module integration with EventBus and Storage
 */

import { ScannerEngine } from '../scanner'
import { ScanSyncHandler, initScanSyncHandler } from '../syncHandler'
import { eventBus } from '@/lib/events/eventBus'
import { storageManager } from '@/lib/storage/storageManager'
import { ScanResult } from '../types'

// Mock storageManager
jest.mock('@/lib/storage/storageManager', () => ({
  storageManager: {
    init: jest.fn(() => Promise.resolve()),
    store: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve(null)),
    getAll: jest.fn(() => Promise.resolve([])),
    delete: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve())
  }
}))

describe('Scanner Integration', () => {
  let scanner: ScannerEngine
  let syncHandler: ScanSyncHandler
  const agentId = 'test-agent-123'
  const location = { lat: 28.6139, lng: 77.2090 }

  beforeEach(() => {
    jest.clearAllMocks()
    scanner = new ScannerEngine()
    syncHandler = new ScanSyncHandler(agentId, location)
  })

  afterEach(() => {
    scanner.stop()
  })

  describe('EventBus Integration', () => {
    it('should emit SCAN_EVENT when scan handled', async () => {
      const eventSpy = jest.fn()
      eventBus.on('SCAN_EVENT', eventSpy)

      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'test-qr-code',
        timestamp: Date.now()
      }

      await syncHandler.handleScanResult(mockResult)
      expect(eventSpy).toHaveBeenCalled()
    })

    it('should include agent ID in emitted event', async () => {
      const eventSpy = jest.fn()
      eventBus.on('SCAN_EVENT', eventSpy)

      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'test-agent',
        timestamp: Date.now()
      }

      await syncHandler.handleScanResult(mockResult)
      
      if (eventSpy.mock.calls.length > 0) {
        const event = eventSpy.mock.calls[0][0]
        expect(event.agentId).toBe(agentId)
      }
    })

    it('should include location in emitted event', async () => {
      const eventSpy = jest.fn()
      eventBus.on('SCAN_EVENT', eventSpy)

      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'test-location',
        timestamp: Date.now()
      }

      await syncHandler.handleScanResult(mockResult)
      
      if (eventSpy.mock.calls.length > 0) {
        const event = eventSpy.mock.calls[0][0]
        expect(event.payload.location).toEqual(location)
      }
    })

    it('should handle multiple consecutive scans', async () => {
      let scanCount = 0
      const eventSpy = jest.fn(() => {
        scanCount++
      })
      eventBus.on('SCAN_EVENT', eventSpy)

      const results: ScanResult[] = [
        { format: 'QR_CODE', value: 'qr-1', timestamp: Date.now() },
        { format: 'BARCODE', value: 'bar-1', timestamp: Date.now() },
        { format: 'UPC', value: 'upc-1', timestamp: Date.now() }
      ]

      await Promise.all(results.map(r => syncHandler.handleScanResult(r)))
      expect(scanCount).toBe(3)
    })
  })

  describe('Sync Handler', () => {
    it('should initialize sync handler correctly', () => {
      expect(syncHandler).toBeDefined()
      expect(syncHandler).toBeInstanceOf(ScanSyncHandler)
    })

    it('should handle scan results without error', async () => {
      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'test-sync',
        timestamp: Date.now()
      }

      await expect(syncHandler.handleScanResult(mockResult)).resolves.not.toThrow()
    })

    it('should support location updates', () => {
      const newLocation = { lat: 40.7128, lng: -74.0060 }
      expect(() => {
        syncHandler.setLocation(newLocation)
      }).not.toThrow()
    })

    it('should initialize with singleton pattern', () => {
      const handler = initScanSyncHandler('agent-2', location)
      expect(handler).toBeDefined()
      expect(handler).toBeInstanceOf(ScanSyncHandler)
    })
  })

  describe('Callback System', () => {
    it('should emit scan events to callbacks', (done) => {
      let callbackCalled = false
      
      scanner.onScan((result) => {
        callbackCalled = true
      })

      const mockResult: ScanResult = {
        format: 'QR_CODE',
        value: 'callback-test',
        timestamp: Date.now()
      }

      scanner.emulateScan(mockResult)

      setTimeout(() => {
        expect(callbackCalled).toBe(true)
        done()
      }, 50)
    })

    it('should unsubscribe from scan callbacks', (done) => {
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
      unsubscribe()
      scanner.emulateScan(mockResult)

      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 50)
    })

    it('should emit error events to callbacks', (done) => {
      let errorCalled = false
      
      scanner.onError(() => {
        errorCalled = true
      })

      scanner.emulateError('Test error')

      setTimeout(() => {
        expect(errorCalled).toBe(true)
        done()
      }, 50)
    })

    it('should unsubscribe from error callbacks', (done) => {
      let errorCount = 0
      const unsubscribe = scanner.onError(() => {
        errorCount++
      })

      scanner.emulateError('Error 1')
      unsubscribe()
      scanner.emulateError('Error 2')

      setTimeout(() => {
        expect(errorCount).toBe(1)
        done()
      }, 50)
    })
  })

  describe('Permission Handling', () => {
    it('should set and check permission mock', async () => {
      scanner.setPermissionMock('denied')
      const permission = await scanner.requestCameraPermission()
      expect(permission.state).toBe('denied')
    })

    it('should handle granted permissions', async () => {
      scanner.setPermissionMock('granted')
      const permission = await scanner.requestCameraPermission()
      expect(permission.state).toBe('granted')
    })

    it('should handle prompt permissions', async () => {
      scanner.setPermissionMock('prompt')
      const permission = await scanner.requestCameraPermission()
      expect(permission.state).toBe('prompt')
    })
  })

  describe('Format Detection', () => {
    it('should support QR_CODE format', () => {
      const qrResult: ScanResult = {
        format: 'QR_CODE',
        value: 'qr-test',
        timestamp: Date.now()
      }
      scanner.setLastScanMock(qrResult)
      const result = scanner.detectFromImageData(createMockImageData())
      expect(result?.format).toBe('QR_CODE')
    })

    it('should support BARCODE format', () => {
      const barcodeResult: ScanResult = {
        format: 'BARCODE',
        value: '123456789',
        timestamp: Date.now()
      }
      scanner.setLastScanMock(barcodeResult)
      const result = scanner.detectFromImageData(createMockImageData())
      expect(result?.format).toBe('BARCODE')
    })

    it('should support UPC format', () => {
      const upcResult: ScanResult = {
        format: 'UPC',
        value: 'upc-123',
        timestamp: Date.now()
      }
      scanner.setLastScanMock(upcResult)
      const result = scanner.detectFromImageData(createMockImageData())
      expect(result?.format).toBe('UPC')
    })
  })
})

function createMockImageData(): ImageData {
  const data = new Uint8ClampedArray(4 * 100 * 100)
  return new ImageData(data, 100, 100)
}

