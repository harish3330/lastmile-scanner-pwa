import type { NextApiRequest, NextApiResponse } from 'next'
import { integrationPaymentService } from '@/services/integrationPaymentService'

interface RefundRequest {
  orderId: string
  refundAmount?: number
  reason?: string
}

interface RefundResponse {
  status: 'success' | 'error'
  message?: string
  orderId?: string
  refundId?: string
  refundAmount?: number
  refundedAt?: number
  code?: string
}

/**
 * POST /api/integrations/payment/refund
 * Process a refund for a payment
 * 
 * Request body:
 * {
 *   "orderId": "order_123",
 *   "refundAmount": 50000, (optional, full refund if not provided)
 *   "reason": "Customer requested cancellation" (optional)
 * }
 * 
 * Response:
 * {
 *   "status": "success" | "error",
 *   "message": "Refund processed successfully",
 *   "orderId": "order_123",
 *   "refundId": "refund_123",
 *   "refundAmount": 50000,
 *   "refundedAt": 1681234567000
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefundResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  try {
    const { orderId, refundAmount, reason } = req.body as RefundRequest

    // Validate required fields
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID is required',
      })
    }

    // Validate refund amount if provided
    if (refundAmount !== undefined) {
      if (typeof refundAmount !== 'number' || refundAmount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Refund amount must be a positive number',
        })
      }
    }

    // Validate reason if provided
    if (reason && typeof reason !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Reason must be a string',
      })
    }

    if (reason && reason.length > 500) {
      return res.status(400).json({
        status: 'error',
        message: 'Reason must not exceed 500 characters',
      })
    }

    // Process refund using service layer
    const result = await integrationPaymentService.processRefund(orderId, refundAmount, reason)

    if (result.status === 'success') {
      return res.status(200).json({
        status: 'success',
        message: 'Refund processed successfully',
        refundId: result.refundId,
        refundAmount: result.refundAmount,
      })
    } else {
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to process refund',
      })
    }
  } catch (error) {
    console.error('[Payment Refund API Error]', error)
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
