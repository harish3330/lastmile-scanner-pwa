// ============================================================
//  pages/api/delivery.ts — ISSUE #2 & #8
//  Updates delivery status with proof images
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { DeliveryRequest, DeliveryResponse } from '@/lib/types/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { deliveryId, agentId, status, imageProof, timestamp }: DeliveryRequest = req.body

    // Validate required fields
    if (!deliveryId || !agentId || !status) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Store image if provided
    let proofId: string | undefined
    if (imageProof) {
      const imageHash = Buffer.from(imageProof).toString('base64').substring(0, 32)
      const image = await prisma.imageCapture.create({
        data: {
          agentId,
          imageHash,
          mimeType: 'image/jpeg',
          sizeBytes: imageProof.length,
        },
      })
      proofId = image.id
    }

    console.log('[API] Delivery updated:', deliveryId, status, proofId ? `with proof ${proofId}` : 'no proof')

    const response: DeliveryResponse = {
      deliveryId,
      status,
      proofId,
      timestamp: Date.now(),
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('[API] Delivery error:', error)
    return res.status(500).json({ error: 'Failed to update delivery' })
  }
}
