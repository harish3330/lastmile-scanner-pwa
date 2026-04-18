// ============================================================
//  pages/api/payment.ts — CASH MANAGEMENT
//  Verify collected vs expected amounts, detect discrepancies
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { PaymentRequest, PaymentResponse } from '@/lib/types/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { transactionId, agentId, expectedAmount, collectedAmount, paymentMode, timestamp }: PaymentRequest =
      req.body

    // Validate required fields
    if (!transactionId || !agentId || expectedAmount === undefined || collectedAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Calculate discrepancy
    const discrepancy = collectedAmount - expectedAmount
    const status = discrepancy === 0 ? 'matched' : 'mismatch'

    // Store transaction in database
    const transaction = await prisma.cashTransaction.create({
      data: {
        transactionId,
        agentId,
        expectedAmount,
        collectedAmount,
        paymentMode: paymentMode || 'cash',
        status,
        discrepancy,
      },
    })

    // Alert if there's a mismatch
    if (status === 'mismatch') {
      console.warn('[API] Payment mismatch detected:', transactionId, `Expected: ${expectedAmount}, Got: ${collectedAmount}`)
    }

    console.log('[API] Payment recorded:', transactionId, status)

    const response: PaymentResponse = {
      transactionId,
      status,
      discrepancy,
      timestamp: Date.now(),
    }

    return res.status(201).json(response)
  } catch (error) {
    console.error('[API] Payment error:', error)
    return res.status(500).json({ error: 'Failed to process payment' })
  }
}
