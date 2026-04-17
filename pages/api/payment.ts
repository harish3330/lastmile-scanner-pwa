/**
 * ISSUE #8 - POST /api/payment Handler
 * Records cash collection, payment, and detects discrepancies
 * 
 * Request: PaymentRequest
 * Response: PaymentResponse
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { paymentService, PaymentResponse } from '@/services/paymentService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse | { message: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' })
  }

  try {
    const {
      transactionId,
      agentId,
      expectedAmount,
      collectedAmount,
      paymentMode,
      timestamp
    } = req.body

    const result = await paymentService.recordPayment({
      transactionId,
      agentId,
      expectedAmount,
      collectedAmount,
      paymentMode,
      timestamp
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('[API] POST /api/payment error:', error)
    return res.status(400).json({
      message: (error as Error).message || 'Failed to record payment'
    })
  }
}
