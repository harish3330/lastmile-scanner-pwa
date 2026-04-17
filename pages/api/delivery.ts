/**
 * ISSUE #8 - POST /api/delivery Handler
 * Records delivery status updates from ISSUE #2 (Frontend)
 * 
 * Request: DeliveryRequest
 * Response: { status: string, deliveryId: string }
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { deliveryService } from '@/services/deliveryService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' })
  }

  try {
    const { agentId, deliveryId, status, imageProof, notes } = req.body

    const result = await deliveryService.recordDelivery({
      agentId,
      deliveryId,
      status,
      imageProof,
      notes
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('[API] POST /api/delivery error:', error)
    return res.status(400).json({
      message: (error as Error).message || 'Failed to record delivery'
    })
  }
}
