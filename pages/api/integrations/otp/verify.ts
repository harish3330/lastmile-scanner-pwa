import type { NextApiRequest, NextApiResponse } from 'next'
import { otpService } from '@/services/otpService'

interface VerifyOTPResponse {
  status: 'verified' | 'invalid' | 'error'
  message: string
  token?: string
  code?: string
}

/**
 * POST /api/integrations/otp/verify
 * Verify OTP code for a phone number
 * 
 * Request body:
 * {
 *   "phoneNumber": "+919876543210",
 *   "otpCode": "123456"
 * }
 * 
 * Response:
 * {
 *   "status": "verified" | "invalid" | "error",
 *   "message": "OTP verified successfully" | error message,
 *   "token": "auth_token_here" (if verified)
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyOTPResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  try {
    const { phoneNumber, otpCode } = req.body

    // Validate inputs
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required and must be a string',
      })
    }

    if (!otpCode || typeof otpCode !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'OTP code is required and must be a string',
      })
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({
        status: 'invalid',
        message: 'OTP must be a 6-digit number',
      })
    }

    // Verify OTP using service layer
    const result = await otpService.verifyOTP(phoneNumber, otpCode)

    if (result.status === 'verified') {
      return res.status(200).json({
        status: 'verified',
        message: result.message,
        token: result.token,
      })
    } else {
      return res.status(400).json({
        status: 'invalid',
        message: result.message || 'OTP verification failed',
      })
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[OTP Verify API Error]', err.message)
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    })
  }
}
