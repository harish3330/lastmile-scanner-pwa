import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { eventBus } from '@/lib/events/eventBus'
import { DetectionEvent } from '@/lib/types/events'
import { v4 as uuid } from 'uuid'

export interface DetectedObject {
  class: string
  score: number
  bbox: [number, number, number, number]
}

/**
 * ObjectDetector: Manages COCO-SSD model loading and inference
 * - Loads TensorFlow.js pre-trained model on first use
 * - Provides detection and filtering methods
 * - Emits DETECTION_EVENT to EventBus
 */
export class ObjectDetector {
  private model: cocoSsd.ObjectDetection | null = null
  private ready = false

  /**
   * Initialize and load COCO-SSD model
   * Handles loading once and caches the model
   */
  async initialize(): Promise<void> {
    try {
      if (this.model) {
        this.ready = true
        return
      }

      console.log('[ML] Loading COCO-SSD model...')
      this.model = await cocoSsd.load()
      this.ready = true
      console.log('[ML] COCO-SSD model loaded successfully')
    } catch (error) {
      console.error('[ML] Failed to load COCO-SSD model:', error)
      this.ready = false
      throw error
    }
  }

  /**
   * Check if model is ready for inference
   */
  isReady(): boolean {
    return this.ready && this.model !== null
  }

  /**
   * Detect objects in image/canvas
   * @param input HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
   * @returns Array of detected objects with class, score, and bbox
   */
  async detect(
    input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ): Promise<DetectedObject[]> {
    if (!this.isReady() || !this.model) {
      console.warn('[ML] Model not ready for detection')
      return []
    }

    try {
      const startTime = performance.now()
      
      // Use COCO-SSD's estimateObjects method
      const predictions = await this.model.estimateObjects(input)
      
      const inferenceTime = performance.now() - startTime
      console.log(`[ML] Inference completed in ${inferenceTime.toFixed(2)}ms`)

      // Convert COCO-SSD predictions to our format
      return predictions.map(pred => ({
        class: pred.class,
        score: pred.score,
        bbox: [pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]] as [
          number,
          number,
          number,
          number
        ]
      }))
    } catch (error) {
      console.error('[ML] Detection error:', error)
      return []
    }
  }

  /**
   * Detect and emit DETECTION_EVENT
   * @param input HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
   * @param agentId Agent performing detection
   */
  async detectAndEmit(
    input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    agentId: string
  ): Promise<void> {
    const detections = await this.detect(input)
    const filtered = this.filterByConfidence(detections, 0.5)
    const parcelCount = filtered.length
    const avgConfidence =
      filtered.length > 0
        ? filtered.reduce((sum, d) => sum + d.score, 0) / filtered.length
        : 0

    const event: DetectionEvent = {
      id: uuid(),
      type: 'DETECTION_EVENT',
      timestamp: Date.now(),
      agentId,
      payload: {
        parcelCount,
        confidence: avgConfidence,
        detections: filtered
      },
      metadata: {
        syncState: 'PENDING',
        attempt: 0
      }
    }

    eventBus.emit(event)
    console.log(`[ML] Detection complete: ${parcelCount} objects detected`)
  }

  /**
   * Filter detections by confidence threshold
   * @param detections Array of detected objects
   * @param threshold Confidence threshold (0-1)
   * @returns Filtered detections
   */
  filterByConfidence(detections: DetectedObject[], threshold: number): DetectedObject[] {
    return detections.filter(detection => detection.score >= threshold)
  }

  /**
   * Count total parcels/objects in detections
   * @param detections Array of detected objects
   * @returns Count of objects
   */
  countParcels(detections: DetectedObject[]): number {
    return detections.length
  }

  /**
   * Calculate average confidence score
   * @param detections Array of detected objects
   * @returns Average confidence (0-1)
   */
  getAverageConfidence(detections: DetectedObject[]): number {
    if (detections.length === 0) return 0
    const sum = detections.reduce((acc, d) => acc + d.score, 0)
    return sum / detections.length
  }

  /**
   * Dispose of model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.ready = false
      console.log('[ML] Model disposed')
    }
  }
}

// Singleton instance
let detectorInstance: ObjectDetector | null = null

/**
 * Get or create singleton detector instance
 */
export function getDetector(): ObjectDetector {
  if (!detectorInstance) {
    detectorInstance = new ObjectDetector()
  }
  return detectorInstance
}

/**
 * Create a new detector instance (useful for testing)
 */
export function createDetector(): ObjectDetector {
  return new ObjectDetector()
}
