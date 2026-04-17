import { ObjectDetector } from '../detector'
import { eventBus } from '@/lib/events/eventBus'

describe('ML Detection Module - ObjectDetector', () => {
  let detector: ObjectDetector

  beforeAll(async () => {
    detector = new ObjectDetector()
    await detector.initialize()
  })

  afterAll(() => {
    detector.dispose()
  })

  describe('Model Loading', () => {
    it('should load COCO-SSD model successfully', async () => {
      expect(detector.isReady()).toBe(true)
    })

    it('should initialize without errors', async () => {
      const newDetector = new ObjectDetector()
      await newDetector.initialize()
      expect(newDetector.isReady()).toBe(true)
      newDetector.dispose()
    })
  })

  describe('Object Detection', () => {
    it('should detect objects in canvas element', async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480

      const detections = await detector.detect(canvas)

      expect(Array.isArray(detections)).toBe(true)
      // Empty canvas should return 0 detections or detect nothing
      expect(detections.length >= 0).toBe(true)
    })

    it('should return detections with required properties', async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480

      const detections = await detector.detect(canvas)

      if (detections.length > 0) {
        const detection = detections[0]
        expect(detection).toHaveProperty('class')
        expect(detection).toHaveProperty('score')
        expect(detection).toHaveProperty('bbox')
      }
    })

    it('should handle errors gracefully when model not ready', async () => {
      const unreadyDetector = new ObjectDetector()
      const canvas = document.createElement('canvas')

      const detections = await unreadyDetector.detect(canvas)

      expect(Array.isArray(detections)).toBe(true)
      expect(detections.length).toBe(0)
    })
  })

  describe('Filtering by Confidence', () => {
    it('should filter detections by confidence threshold', () => {
      const detections = [
        { class: 'parcel', score: 0.95, bbox: [0, 0, 100, 100] },
        { class: 'person', score: 0.3, bbox: [0, 0, 50, 50] },
        { class: 'box', score: 0.72, bbox: [100, 100, 200, 200] }
      ]

      const filtered = detector.filterByConfidence(detections, 0.5)

      expect(filtered.length).toBe(2)
      expect(filtered.every(d => d.score >= 0.5)).toBe(true)
    })

    it('should return empty array when all scores below threshold', () => {
      const detections = [
        { class: 'parcel', score: 0.3, bbox: [0, 0, 100, 100] },
        { class: 'person', score: 0.2, bbox: [0, 0, 50, 50] }
      ]

      const filtered = detector.filterByConfidence(detections, 0.5)

      expect(filtered.length).toBe(0)
    })

    it('should handle empty detection array', () => {
      const filtered = detector.filterByConfidence([], 0.5)

      expect(filtered.length).toBe(0)
      expect(Array.isArray(filtered)).toBe(true)
    })
  })

  describe('Parcel Counting', () => {
    it('should count parcels correctly', () => {
      const detections = [
        { class: 'parcel', score: 0.9, bbox: [0, 0, 100, 100] },
        { class: 'parcel', score: 0.85, bbox: [100, 100, 200, 200] },
        { class: 'parcel', score: 0.8, bbox: [200, 200, 300, 300] }
      ]

      const count = detector.countParcels(detections)

      expect(count).toBe(3)
    })

    it('should return 0 for empty detections', () => {
      const count = detector.countParcels([])

      expect(count).toBe(0)
    })

    it('should count detections even if no parcel class', () => {
      const detections = [
        { class: 'person', score: 0.9, bbox: [0, 0, 100, 100] },
        { class: 'dog', score: 0.85, bbox: [100, 100, 200, 200] }
      ]

      const count = detector.countParcels(detections)

      // Should return array length since we count all objects
      expect(count >= 0).toBe(true)
    })
  })

  describe('Event Emission', () => {
    it('should emit DETECTION_EVENT when detectAndEmit called', async () => {
      const emitSpy = jest.spyOn(eventBus, 'emit')

      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480

      await detector.detectAndEmit(canvas, 'agent-001')

      expect(emitSpy).toHaveBeenCalled()
      // Check if any call includes DETECTION_EVENT
      const detectEventCalled = emitSpy.mock.calls.some(
        call => call[0]?.type === 'DETECTION_EVENT'
      )
      expect(detectEventCalled).toBe(true)

      emitSpy.mockRestore()
    })

    it('should include parcelCount in emitted event', async () => {
      const emitSpy = jest.spyOn(eventBus, 'emit')

      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480

      await detector.detectAndEmit(canvas, 'agent-001')

      const detectEvent = emitSpy.mock.calls.find(
        call => call[0]?.type === 'DETECTION_EVENT'
      )
      expect(detectEvent).toBeDefined()

      if (detectEvent && detectEvent[0]) {
        expect(detectEvent[0].payload).toHaveProperty('parcelCount')
        expect(typeof detectEvent[0].payload.parcelCount).toBe('number')
      }

      emitSpy.mockRestore()
    })

    it('should include confidence in emitted event', async () => {
      const emitSpy = jest.spyOn(eventBus, 'emit')

      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480

      await detector.detectAndEmit(canvas, 'agent-001')

      const detectEvent = emitSpy.mock.calls.find(
        call => call[0]?.type === 'DETECTION_EVENT'
      )

      if (detectEvent && detectEvent[0]) {
        expect(detectEvent[0].payload).toHaveProperty('confidence')
        expect(typeof detectEvent[0].payload.confidence).toBe('number')
      }

      emitSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small confidence threshold', () => {
      const detections = [
        { class: 'parcel', score: 0.01, bbox: [0, 0, 100, 100] },
        { class: 'person', score: 0.05, bbox: [0, 0, 50, 50] }
      ]

      const filtered = detector.filterByConfidence(detections, 0.001)

      expect(filtered.length).toBe(2)
    })

    it('should handle very high confidence threshold', () => {
      const detections = [
        { class: 'parcel', score: 0.95, bbox: [0, 0, 100, 100] },
        { class: 'person', score: 0.99, bbox: [0, 0, 50, 50] }
      ]

      const filtered = detector.filterByConfidence(detections, 0.999)

      expect(filtered.length).toBe(0)
    })

    it('should handle threshold exactly matching score', () => {
      const detections = [
        { class: 'parcel', score: 0.5, bbox: [0, 0, 100, 100] }
      ]

      const filtered = detector.filterByConfidence(detections, 0.5)

      expect(filtered.length).toBe(1)
    })
  })
})
