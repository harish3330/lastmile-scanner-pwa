import type { NextApiRequest, NextApiResponse } from 'next'
import { paymentModule } from '@/lib/modules/integrations'

interface VerifyPaymentRequest {
  orderId: string
  paymentId: string
  signature: string
  paidAmount?: number
}

interface VerifyPaymentResponse {
  status: 'verified' | 'invalid' | 'error'
  message?: string
  orderId?: string
  paymentId?: string
  amount?: number
  verifiedAt?: number
  code?: string
}

/**
 * POST /api/integrations/payment/verify
 * Verify a Razorpay payment signature
 * 
 * Request body:
 * {
 *   "orderId": "order_123",
 *   "paymentId": "pay_123",
 *   "signature": "sig_hash_from_razorpay",
 *   "paidAmount": 50000 (optional, for amount verification)
 * }
 * 
 * Response:
 * {
 *   "status": "verified" | "invalid" | "error",
 *   "message": "Payment verified successfully",
 *   "orderId": "order_123",
 *   "paymentId": "pay_123",
 *   "amount": 50000,
 *   "verifiedAt": 1681234567000
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyPaymentResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  try {
    const { orderId, paymentId, signature, paidAmount } = req.body as VerifyPaymentRequest

    // Validate required fields
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID is required',
      })
    }

    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment ID is required',
      })
    }

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment signature is required',
      })
    }

    if (signature.length < 32) {
      return res.status(400).json({
        status: 'invalid',
        message: 'Invalid signature format',
      })
    }

    // Validate amount if provided
    if (paidAmount !== undefined) {
      if (typeof paidAmount !== 'number' || paidAmount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Paid amount must be a positive number',
        })
      }
    }

    // Verify payment
    const result = await paymentModule.verifyPayment(orderId, paymentId, signature, paidAmount)

    if (result.verified) {
      return res.status(200).json({
        status: 'verified',
        message: 'Payment verified successfully',
        orderId,
        paymentId,
      })
    } else {
      // Determine if it's invalid signature or server error
      const statusCode = result.status === 'failed' ? 400 : 500

      return res.status(statusCode).json({
        status: 'invalid',
        message: result.message || 'Payment verification failed',
      })
    }
  } catch (error) {
    console.error('[Payment Verify API Error]', error)
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
