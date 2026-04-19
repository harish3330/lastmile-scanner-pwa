import type { NextApiRequest, NextApiResponse } from 'next'
import { integrationPaymentService } from '@/services/integrationPaymentService'

interface CreateOrderRequest {
  amount: number
  deliveryId: string
  method?: 'card' | 'netbanking' | 'upi' | 'wallet'
  receipt?: string
  currency?: string
}

interface CreateOrderResponse {
  status: 'success' | 'error'
  message?: string
  orderId?: string
  amount?: number
  currency?: string
  code?: string
}

/**
 * POST /api/integrations/payment/orders
 * Create a payment order for a delivery
 * 
 * Request body:
 * {
 *   "amount": 50000 (in paise/cents),
 *   "deliveryId": "delivery_123",
 *   "method": "upi", (optional)
 *   "receipt": "receipt_123", (optional)
 *   "currency": "INR" (optional, default: INR)
 * }
 * 
 * Response:
 * {
 *   "status": "success" | "error",
 *   "message": "Order created successfully",
 *   "orderId": "order_123",
 *   "amount": 50000,
 *   "currency": "INR"
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateOrderResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  try {
    const { amount, deliveryId, method, receipt, currency = 'INR' } = req.body as CreateOrderRequest

    // Validate required fields
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'Amount is required and must be a number (in smallest currency unit)',
      })
    }

    if (amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount must be greater than 0',
      })
    }

    if (amount < 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Minimum order amount is 1.00 (100 paise)',
      })
    }

    if (amount > 1000000000) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount exceeds maximum limit of 10,000,000.00',
      })
    }

    if (!deliveryId || typeof deliveryId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Delivery ID is required',
      })
    }

    // Validate optional payment method
    if (method && !['card', 'netbanking', 'upi', 'wallet'].includes(method)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment method. Must be: card, netbanking, upi, or wallet',
      })
    }

    // Validate currency
    if (!['INR', 'USD', 'EUR', 'GBP'].includes(currency)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid currency. Supported: INR, USD, EUR, GBP',
      })
    }

    // Create order using service layer
    const result = await integrationPaymentService.createOrder(amount, deliveryId, method, receipt, currency)

    if (result.status === 'success') {
      return res.status(200).json({
        status: 'success',
        message: 'Order created successfully',
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
      })
    } else {
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to create payment order',
      })
    }
  } catch (error) {
    console.error('[Payment Order API Error]', error)
    const err = error as any
    return res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
      code: err.code,
    })
  }
}
