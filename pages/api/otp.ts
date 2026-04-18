// ============================================================
//  pages/api/otp.ts — OTP GENERATION & VERIFICATION
//  ISSUE #10 API - Send OTP and verify authentication codes
// ============================================================

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { OTPRequest, OTPResponse } from '@/lib/types/api'
import crypto from 'crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phoneNumber, action, otp }: OTPRequest = req.body

    // Validate required fields
    if (!phoneNumber || !action) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (action === 'send') {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store OTP in database
      const otpRecord = await prisma.oTP.create({
        data: {
          phoneNumber,
          otpCode,
          expiresAt,
        },
      })

      // In production, send via Twilio or similar service
      console.log(`[API] OTP sent to ${phoneNumber}: ${otpCode}`)

      const response: OTPResponse = {
        phoneNumber,
        verified: false,
        message: `OTP sent to ${phoneNumber}. Valid for 10 minutes.`,
      }

      return res.status(200).json(response)
    } else if (action === 'verify') {
      // Verify OTP code
      if (!otp) {
        return res.status(400).json({ error: 'OTP code required for verification' })
      }

      // Find latest OTP for this phone number
      const otpRecord = await prisma.oTP.findFirst({
        where: { phoneNumber },
        orderBy: { createdAt: 'desc' },
      })

      if (!otpRecord) {
        return res.status(401).json({ error: 'No OTP found for this phone number' })
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        return res.status(401).json({ error: 'OTP has expired' })
      }

      // Check if OTP matches
      if (otpRecord.otpCode !== otp) {
        return res.status(401).json({ error: 'Invalid OTP code' })
      }

      // Mark as verified
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      })

      console.log('[API] OTP verified successfully for:', phoneNumber)

      const response: OTPResponse = {
        phoneNumber,
        verified: true,
        message: 'OTP verified successfully. You can now proceed with authentication.',
      }

      return res.status(200).json(response)
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "send" or "verify"' })
    }
  } catch (error) {
    console.error('[API] OTP error:', error)
    return res.status(500).json({ error: 'Failed to process OTP request' })
  }
}
