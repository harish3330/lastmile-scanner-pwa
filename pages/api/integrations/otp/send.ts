import type { NextApiRequest, NextApiResponse } from 'next'
import { otpModule } from '@/lib/modules/integrations'
import type { OTPResponse } from '@/lib/modules/integrations/types'

/**
 * POST /api/integrations/otp/send
 * Send OTP to phone number
 * 
 * Request body:
 * {
 *   "phoneNumber": "+919876543210"
 * }
 * 
 * Response:
 * {
 *   "status": "sent" | "error",
 *   "message": "OTP sent successfully" | error message,
 *   "expiresIn": 300 (seconds)
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OTPResponse & { expiresIn?: number } | { error: string; code?: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phoneNumber } = req.body

    // Validate phone number
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({
        error: 'Phone number is required and must be a string',
      })
    }

    // Validate phone format (basic international format check)
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        error: 'Invalid phone number format',
      })
    }

    // Generate OTP
    const result = await otpModule.generateOTP(phoneNumber)

    if (result.status === 'sent') {
      return res.status(200).json({
        status: 'sent',
        message: result.message,
        expiresIn: 300, // 5 minutes
      })
    } else {
      return res.status(400).json({
        error: result.message || 'Failed to send OTP',
      })
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[OTP Send API Error]', err.message)
    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}
