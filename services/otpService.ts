/**
 * ISSUE #10 - OTP Service
 * Handles OTP generation, verification, and authentication flow
 * 
 * Dependency: OTP Module (external integration with MSG91)
 * Integration: Uses eventBus for OTP_EVENT publishing
 */

import { otpModule } from '@/lib/modules/integrations'
import { eventBus } from '@/lib/events/eventBus'
import type { OTPEvent } from '@/lib/types/events'

export interface OTPServiceRequest {
  phoneNumber: string
  testMode?: boolean
}

export interface OTPServiceResponse {
  status: 'sent' | 'verified' | 'error'
  message: string
  token?: string
  expiresIn?: number
}

export class OTPService {
  /**
   * Send OTP to phone number
   * Validates phone format and delegates to OTP module
   */
  async sendOTP(phoneNumber: string, testMode: boolean = false): Promise<OTPServiceResponse> {
    try {
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        return {
          status: 'error',
          message: 'Phone number is required'
        }
      }

      // Validate phone format
      const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
      if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
        return {
          status: 'error',
          message: 'Invalid phone number format. Please provide number with country code (e.g., +919876543210)'
        }
      }

      // Call OTP module to generate and send OTP
      const result = await otpModule.generateOTP(phoneNumber)

      if (result.status === 'sent') {
        // Publish OTP_EVENT
        this.emitOTPEvent({
          phone: phoneNumber,
          code: result.otp || 'MASKED',
          verified: false,
          timestamp: Date.now()
        })

        return {
          status: 'sent',
          message: result.message || 'OTP sent successfully',
          expiresIn: 300 // 5 minutes
        }
      } else {
        return {
          status: 'error',
          message: result.message || 'Failed to send OTP'
        }
      }
    } catch (error) {
      console.error('[OTPService] Error sending OTP:', error)
      return {
        status: 'error',
        message: 'An error occurred while sending OTP. Please try again later.'
      }
    }
  }

  /**
   * Verify OTP code for phone number
   * Validates OTP and returns authentication token if successful
   */
  async verifyOTP(phoneNumber: string, otpCode: string): Promise<OTPServiceResponse> {
    try {
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        return {
          status: 'error',
          message: 'Phone number is required'
        }
      }

      if (!otpCode || typeof otpCode !== 'string') {
        return {
          status: 'error',
          message: 'OTP code is required'
        }
      }

      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(otpCode)) {
        return {
          status: 'error',
          message: 'OTP must be a 6-digit number'
        }
      }

      // Call OTP module to verify
      const result = await otpModule.verifyOTP(phoneNumber, otpCode)

      if (result.verified) {
        // Publish OTP_EVENT with verification status
        this.emitOTPEvent({
          phone: phoneNumber,
          code: otpCode,
          verified: true,
          timestamp: Date.now()
        })

        return {
          status: 'verified',
          message: result.message || 'OTP verified successfully',
          token: result.token || `auth_${Date.now()}_${phoneNumber.slice(-4)}`
        }
      } else {
        return {
          status: 'error',
          message: result.message || 'OTP verification failed'
        }
      }
    } catch (error) {
      console.error('[OTPService] Error verifying OTP:', error)
      return {
        status: 'error',
        message: 'An error occurred while verifying OTP. Please try again later.'
      }
    }
  }

  /**
   * Emit OTP event to event bus
   */
  private emitOTPEvent(data: OTPEvent) {
    try {
      eventBus.publish('OTP_EVENT', data)
    } catch (error) {
      console.warn('[OTPService] Failed to emit OTP_EVENT:', error)
    }
  }
}

// Export singleton instance
export const otpService = new OTPService()
