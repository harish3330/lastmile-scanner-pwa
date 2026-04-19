/**
 * ISSUE #10 - Payment Service
 * Handles payment order creation, verification, and refund processing
 * 
 * Dependency: Payment Module (external integration with Razorpay)
 * Integration: Uses eventBus for PAYMENT_EVENT publishing
 */

import { paymentModule } from '@/lib/modules/integrations'
import { eventBus } from '@/lib/events/eventBus'
import type { PaymentEvent } from '@/lib/types/events'

export interface PaymentOrderServiceRequest {
  amount: number
  deliveryId: string
  method?: 'card' | 'netbanking' | 'upi' | 'wallet'
  receipt?: string
  currency?: string
}

export interface PaymentOrderServiceResponse {
  status: 'success' | 'error'
  message?: string
  orderId?: string
  amount?: number
  currency?: string
  code?: string
}

export interface PaymentVerifyServiceRequest {
  orderId: string
  paymentId: string
  signature: string
  paidAmount?: number
}

export interface PaymentVerifyServiceResponse {
  status: 'verified' | 'invalid' | 'error'
  message?: string
  orderId?: string
  paymentId?: string
  amount?: number
  verifiedAt?: number
  code?: string
}

export interface PaymentRefundServiceRequest {
  orderId: string
  refundAmount?: number
  reason?: string
}

export interface PaymentRefundServiceResponse {
  status: 'success' | 'error'
  message?: string
  orderId?: string
  refundId?: string
  refundAmount?: number
  refundedAt?: number
  code?: string
}

export class IntegrationPaymentService {
  /**
   * Create payment order
   * Validates input and delegates to payment module
   */
  async createOrder(
    amount: number,
    deliveryId: string,
    method?: 'card' | 'netbanking' | 'upi' | 'wallet',
    receipt?: string,
    currency: string = 'INR'
  ): Promise<PaymentOrderServiceResponse> {
    try {
      // Validate required fields
      if (!amount || typeof amount !== 'number') {
        return {
          status: 'error',
          message: 'Amount is required and must be a number (in smallest currency unit)'
        }
      }

      if (amount <= 0) {
        return {
          status: 'error',
          message: 'Amount must be greater than 0'
        }
      }

      if (amount < 100) {
        return {
          status: 'error',
          message: 'Minimum order amount is 1.00 (100 paise)'
        }
      }

      if (amount > 1000000000) {
        return {
          status: 'error',
          message: 'Amount exceeds maximum limit of 10,000,000.00'
        }
      }

      if (!deliveryId || typeof deliveryId !== 'string') {
        return {
          status: 'error',
          message: 'Delivery ID is required'
        }
      }

      // Validate optional payment method
      if (method && !['card', 'netbanking', 'upi', 'wallet'].includes(method)) {
        return {
          status: 'error',
          message: 'Invalid payment method. Must be: card, netbanking, upi, or wallet'
        }
      }

      // Validate currency
      if (!['INR', 'USD', 'EUR', 'GBP'].includes(currency)) {
        return {
          status: 'error',
          message: 'Invalid currency. Supported: INR, USD, EUR, GBP'
        }
      }

      // Create order using payment module
      const result = await paymentModule.createOrder(amount, deliveryId, method, receipt, currency)

      if (result.status === 'created') {
        // Publish PAYMENT_EVENT
        this.emitPaymentEvent({
          expectedAmount: amount,
          collectedAmount: 0,
          paymentMode: (method as 'cash' | 'card' | 'upi') || 'card',
          status: 'mismatch',
          transactionId: result.orderId || '',
          timestamp: Date.now()
        })

        return {
          status: 'success',
          message: 'Order created successfully',
          orderId: result.orderId,
          amount: result.amount,
          currency: result.currency
        }
      } else {
        return {
          status: 'error',
          message: result.message || 'Failed to create payment order'
        }
      }
    } catch (error) {
      console.error('[IntegrationPaymentService] Error creating order:', error)
      return {
        status: 'error',
        message: 'An error occurred while creating payment order. Please try again later.'
      }
    }
  }

  /**
   * Verify payment
   * Validates signature and payment details
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    paidAmount?: number
  ): Promise<PaymentVerifyServiceResponse> {
    try {
      // Validate required fields
      if (!orderId || typeof orderId !== 'string') {
        return {
          status: 'error',
          message: 'Order ID is required'
        }
      }

      if (!paymentId || typeof paymentId !== 'string') {
        return {
          status: 'error',
          message: 'Payment ID is required'
        }
      }

      if (!signature || typeof signature !== 'string') {
        return {
          status: 'error',
          message: 'Payment signature is required'
        }
      }

      if (signature.length < 32) {
        return {
          status: 'invalid',
          message: 'Invalid signature format'
        }
      }

      // Validate amount if provided
      if (paidAmount !== undefined) {
        if (typeof paidAmount !== 'number' || paidAmount <= 0) {
          return {
            status: 'error',
            message: 'Paid amount must be a positive number'
          }
        }
      }

      // Verify payment using payment module
      const result = await paymentModule.verifyPayment(orderId, paymentId, signature, paidAmount)

      if (result.verified) {
        // Publish PAYMENT_EVENT for successful verification
        this.emitPaymentEvent({
          expectedAmount: result.amount || 0,
          collectedAmount: result.amount || 0,
          paymentMode: 'card',
          status: 'matched',
          transactionId: paymentId,
          timestamp: Date.now()
        })

        return {
          status: 'verified',
          message: 'Payment verified successfully',
          orderId,
          paymentId,
          amount: result.amount,
          verifiedAt: Date.now()
        }
      } else {
        // Determine if it's invalid signature or server error
        const statusCode = result.status === 'failed' ? 'invalid' : 'error'

        return {
          status: statusCode as any,
          message: result.message || 'Payment verification failed'
        }
      }
    } catch (error) {
      console.error('[IntegrationPaymentService] Error verifying payment:', error)
      return {
        status: 'error',
        message: 'An error occurred while verifying payment. Please try again later.'
      }
    }
  }

  /**
   * Process refund
   * Initiates refund for a paid order
   */
  async processRefund(
    orderId: string,
    refundAmount?: number,
    reason?: string
  ): Promise<PaymentRefundServiceResponse> {
    try {
      // Validate required fields
      if (!orderId || typeof orderId !== 'string') {
        return {
          status: 'error',
          message: 'Order ID is required'
        }
      }

      // Validate refund amount if provided
      if (refundAmount !== undefined) {
        if (typeof refundAmount !== 'number' || refundAmount <= 0) {
          return {
            status: 'error',
            message: 'Refund amount must be a positive number'
          }
        }
      }

      // Validate reason if provided
      if (reason && typeof reason !== 'string') {
        return {
          status: 'error',
          message: 'Reason must be a string'
        }
      }

      if (reason && reason.length > 500) {
        return {
          status: 'error',
          message: 'Reason must not exceed 500 characters'
        }
      }

      // Process refund using payment module
      const result = await paymentModule.processRefund(orderId, refundAmount)

      if (result.status === 'success') {
        return {
          status: 'success',
          message: 'Refund processed successfully',
          refundId: result.refundId,
          refundAmount: result.refundAmount,
          refundedAt: Date.now()
        }
      } else {
        return {
          status: 'error',
          message: result.message || 'Failed to process refund'
        }
      }
    } catch (error) {
      console.error('[IntegrationPaymentService] Error processing refund:', error)
      return {
        status: 'error',
        message: 'An error occurred while processing refund. Please try again later.'
      }
    }
  }

  /**
   * Emit payment event to event bus
   */
  private emitPaymentEvent(data: PaymentEvent) {
    try {
      eventBus.publish('PAYMENT_EVENT', data)
    } catch (error) {
      console.warn('[IntegrationPaymentService] Failed to emit PAYMENT_EVENT:', error)
    }
  }
}

// Export singleton instance
export const integrationPaymentService = new IntegrationPaymentService()
