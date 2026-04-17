/**
 * ISSUE #9 - POST/GET /api/detect Handler
 * ML-based parcel detection endpoint
 * 
 * POST: Accept base64 encoded images and return parcel count + detections
 * GET: Retrieve detection history for an agent
 * 
 * Request: { imageBase64: string, agentId: string, timestamp: number }
 * Response: { parcelCount: number, confidence: number, detections: Parcel[], inferenceTime: number }
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { DetectRequest, DetectResponse } from '@/lib/types/api'
import { getDetector } from '@/lib/modules/ml/detector'
import { PostProcessor } from '@/lib/modules/ml/postProcessor'
import { detectService } from '@/services/detectService'
import { eventBus } from '@/lib/events/eventBus'
import { DetectionEvent } from '@/lib/types/events'
import { v4 as uuid } from 'uuid'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DetectResponse | any>
) {
  // Handle GET requests - retrieve detection history
  if (req.method === 'GET') {
    return handleGet(req, res)
  }

  // Handle POST requests - perform detection
  if (req.method === 'POST') {
    return handlePost(req, res)
  }

  // Method not allowed
  return res.status(405).json({
    message: 'Method not allowed. Use POST or GET.'
  })
}

/**
 * Handle POST /api/detect - Perform ML detection
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const startTime = Date.now()
    const { imageBase64, agentId, timestamp, minConfidence = 0.5 } =
      req.body as DetectRequest

    // Validate required fields
    if (!imageBase64 || !agentId) {
      return res.status(400).json({
        message: 'Missing required fields: imageBase64, agentId'
      })
    }

    if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
      return res.status(400).json({
        message: 'Invalid imageBase64: must be non-empty string'
      })
    }

    console.log('[API] POST /api/detect - Starting detection for agent:', agentId)

    // Get detector instance
    const detector = getDetector()

    // Initialize model if not ready
    if (!detector.isReady()) {
      console.log('[API] Initializing ML model...')
      await detector.initialize()
    }

    // Convert base64 to image element
    const img = new Image()
    img.src = `data:image/jpeg;base64,${imageBase64}`

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('Failed to load image'))
      // Set timeout to prevent hanging
      setTimeout(() => reject(new Error('Image load timeout')), 5000)
    })

    // Run detection
    const mlStartTime = performance.now()
    const detections = await detector.detect(img)
    const inferenceTime = Math.round(performance.now() - mlStartTime)

    // Filter by confidence threshold
    const filtered = PostProcessor.filterByClass(
      detections.filter(d => d.score >= minConfidence),
      '' // Keep all classes
    )

    // Calculate metrics
    const parcelCount = filtered.length
    const avgConfidence = PostProcessor.calculateConfidence(filtered)

    // Save to database using DetectService
    try {
      await detectService.recordDetection({
        agentId,
        parcelCount,
        confidence: avgConfidence,
        detections: filtered,
        inferenceTime,
        timestamp: timestamp || Date.now()
      })
      console.log('[API] Detection saved to database')
    } catch (dbError) {
      console.error('[API] Failed to save detection to database:', dbError)
      // Continue anyway - don't fail the response if DB save fails
    }

    // Emit DETECTION_EVENT to EventBus
    const event: DetectionEvent = {
      id: uuid(),
      type: 'DETECTION_EVENT',
      timestamp: Date.now(),
      agentId,
      payload: {
        parcelCount,
        confidence: avgConfidence,
        detections: filtered.map((d, idx) => ({
          id: uuid(),
          class: d.class,
          confidence: d.score,
          bbox: d.bbox
        }))
      },
      metadata: {
        syncState: 'PENDING',
        attempt: 0
      }
    }
    eventBus.emit(event)

    const processingTime = Date.now() - startTime

    console.log('[API] Detection complete:', {
      parcelCount,
      confidence: avgConfidence,
      inferenceTime,
      processingTime
    })

    // Return response
    const response: DetectResponse = {
      parcelCount,
      confidence: avgConfidence,
      detections: filtered.map((d, idx) => ({
        id: `${agentId}-${idx}`,
        class: d.class,
        confidence: d.score,
        bbox: d.bbox
      })),
      inferenceTime,
      timestamp: Date.now()
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('[API] POST /api/detect error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process detection'

    return res.status(500).json({
      message: errorMessage,
      parcelCount: 0,
      confidence: 0,
      detections: [],
      inferenceTime: 0,
      timestamp: Date.now()
    })
  }
}

/**
 * Handle GET /api/detect - Retrieve detection history
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { agentId, limit = '10', offset = '0' } = req.query

    const limitNum = Math.min(Math.max(1, parseInt(limit as string) || 10), 100)
    const offsetNum = Math.max(0, parseInt(offset as string) || 0)

    console.log('[API] GET /api/detect - Fetching detections:', {
      agentId,
      limit: limitNum,
      offset: offsetNum
    })

    let result

    if (agentId && typeof agentId === 'string') {
      // Get detections for specific agent
      result = await detectService.getDetectionsByAgent(agentId, limitNum, offsetNum)
    } else {
      // Get recent detections across all agents
      result = await detectService.getRecentDetections(limitNum, offsetNum)
    }

    return res.status(200).json({
      detections: result.detections,
      total: result.total,
      limit: limitNum,
      offset: offsetNum
    })
  } catch (error) {
    console.error('[API] GET /api/detect error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch detections'

    return res.status(500).json({
      message: errorMessage,
      detections: [],
      total: 0
    })
  }
}
