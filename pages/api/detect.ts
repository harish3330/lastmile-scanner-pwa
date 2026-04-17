/**
 * ISSUE #8 - POST /api/detect Handler (Placeholder)
 * This endpoint will be implemented by ISSUE #9 (ML Module)
 * For now, it's a stub that acknowledges the request
 * 
 * Request: { imageBase64: string, agentId: string, timestamp?: number }
 * Response: { parcelCount: number, confidence: number, detections: any[] }
 */

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' })
  }

  // ISSUE #9 (ML Module) will implement the actual detection logic
  // For now, return a placeholder response

  try {
    const { imageBase64, agentId, timestamp } = req.body

    if (!imageBase64 || !agentId) {
      return res.status(400).json({
        message: 'Missing required fields: imageBase64, agentId'
      })
    }

    // Placeholder response
    // ISSUE #9 will replace this with actual ML inference
    return res.status(200).json({
      parcelCount: 0,
      confidence: 0,
      detections: [],
      message: '[STUB] ML detection not yet implemented by Issue #9',
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('[API] POST /api/detect error:', error)
    return res.status(400).json({
      message: (error as Error).message || 'Failed to process detection'
    })
  }
}
