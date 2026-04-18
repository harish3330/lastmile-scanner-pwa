// ============================================================
//  pages/api/detect.ts — ISSUE #9 & #8
//  Receives base64 image and parcel detection results
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { DetectRequest, DetectResponse } from '@/lib/types/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageBase64, agentId, timestamp, location }: DetectRequest = req.body

    // Validate required fields
    if (!imageBase64 || !agentId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create image hash from base64
    const imageHash = Buffer.from(imageBase64).toString('base64').substring(0, 32)

    // Store image in database
    const image = await prisma.imageCapture.create({
      data: {
        agentId,
        imageHash,
        mimeType: 'image/jpeg',
        sizeBytes: imageBase64.length,
        latitude: location?.lat,
        longitude: location?.lng,
      },
    })

    // Mock parcel detection results (would be from ML model in production)
    const detections = {
      parcelCount: 5, // Mock data
      confidence: 0.92,
      detections: [
        { id: '1', bbox: [0.1, 0.1, 0.3, 0.3], confidence: 0.95, label: 'parcel' },
        { id: '2', bbox: [0.4, 0.2, 0.6, 0.5], confidence: 0.88, label: 'parcel' },
      ],
    }

    // Store detection results
    const detection = await prisma.detection.create({
      data: {
        agentId,
        parcelCount: detections.parcelCount,
        confidence: detections.confidence,
        imageHash,
      },
    })

    console.log('[API] Detection recorded:', detection.id, `${detections.parcelCount} parcels detected`)

    const response: DetectResponse = {
      parcelCount: detections.parcelCount,
      confidence: detections.confidence,
      detections: detections.detections as any,
      inferenceTime: 45, // milliseconds
      timestamp: Date.now(),
    }

    return res.status(201).json(response)
  } catch (error) {
    console.error('[API] Detection error:', error)
    return res.status(500).json({ error: 'Failed to process detection' })
  }
}
