/**
 * ISSUE #8 - Payment Service
 * Handles cash collection, payment recording, and discrepancy detection
 * 
 * Dependency: Prisma Client (database)
 */

import prisma from '@/lib/db/client'

export interface PaymentRequest {
  transactionId: string
  agentId: string
  expectedAmount: number
  collectedAmount: number
  paymentMode: 'cash' | 'card' | 'upi'
  timestamp?: number
}

export interface PaymentResponse {
  transactionId: string
  status: 'matched' | 'mismatch'
  discrepancy: number
  timestamp: number
}

export class PaymentService {
  /**
   * Record payment/cash collection
   * Automatically detects mismatches (underpaid/overpaid)
   */
  async recordPayment(req: PaymentRequest): Promise<PaymentResponse> {
    // Validate required fields
    if (!req.transactionId || !req.agentId || req.expectedAmount == null || req.collectedAmount == null) {
      throw new Error('Missing required payment fields')
    }

    try {
      // Calculate discrepancy
      const discrepancy = req.collectedAmount - req.expectedAmount

      const status = discrepancy === 0 ? 'matched' : 'mismatch'

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          transactionId: req.transactionId,
          agentId: req.agentId,
          expectedAmount: req.expectedAmount,
          collectedAmount: req.collectedAmount,
          paymentMode: req.paymentMode,
          status,
          discrepancy
        }
      })

      return {
        transactionId: payment.transactionId,
        status: payment.status as 'matched' | 'mismatch',
        discrepancy: payment.discrepancy,
        timestamp: payment.timestamp.getTime()
      }
    } catch (error) {
      console.error('[PaymentService] Error recording payment:', error)
      throw new Error('Failed to record payment')
    }
  }

  /**
   * Get all payments for an agent
   */
  async getPaymentsByAgent(agentId: string, limit = 50) {
    try {
      const payments = await prisma.payment.findMany({
        where: { agentId },
        orderBy: { timestamp: 'desc' },
        take: limit
      })

      const total = await prisma.payment.count({ where: { agentId } })

      return { payments, total }
    } catch (error) {
      console.error('[PaymentService] Error fetching payments:', error)
      throw error
    }
  }

  /**
   * Get payment mismatches (discrepancies)
   * Used for auditing and reconciliation
   */
  async getMismatchedPayments(agentId?: string) {
    try {
      const mismatches = await prisma.payment.findMany({
        where: {
          status: 'mismatch',
          ...(agentId && { agentId })
        },
        orderBy: { timestamp: 'desc' }
      })

      return mismatches
    } catch (error) {
      console.error('[PaymentService] Error fetching mismatches:', error)
      throw error
    }
  }

  /**
   * Get daily cash collection summary
   */
  async getDailySummary(agentId?: string, date?: Date) {
    const targetDate = date || new Date()
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    try {
      const payments = await prisma.payment.findMany({
        where: {
          timestamp: {
            gte: dayStart,
            lt: dayEnd
          },
          ...(agentId && { agentId })
        }
      })

      const summary = {
        totalExpected: payments.reduce((sum, p) => sum + p.expectedAmount, 0),
        totalCollected: payments.reduce((sum, p) => sum + p.collectedAmount, 0),
        matchedCount: payments.filter(p => p.status === 'matched').length,
        mismatchedCount: payments.filter(p => p.status === 'mismatch').length,
        totalMismatch: payments.reduce((sum, p) => sum + p.discrepancy, 0)
      }

      return summary
    } catch (error) {
      console.error('[PaymentService] Error getting daily summary:', error)
      throw error
    }
  }
}

export const paymentService = new PaymentService()
