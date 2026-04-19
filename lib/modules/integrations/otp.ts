/**
 * OTP Module - External Integrations
 * Member 10 - Issue #10
 * 
 * Integrates with MSG91 for OTP generation and verification
 * 
 * Usage:
 * ```
 * const otpModule = new OTPModule()
 * const response = await otpModule.generateOTP('+919876543210')
 * const verify = await otpModule.verifyOTP('+919876543210', '123456')
 * ```
 */

import { v4 as uuid } from 'uuid'
import { eventBus } from '@/lib/events/eventBus'
import { OTPEvent } from '@/lib/types/events'
import { OTPConfig, OTPGenerationResponse, OTPVerificationResponse, OTPStorage, OTPResponse, OTPRequest, VerifyOTPRequest, VerifyOTPResponse } from './types'

export class OTPModule {
  private config: OTPConfig
  private otpStorage: Map<string, OTPStorage> = new Map()
  private readonly MSG91_ENDPOINT = 'https://api.msg91.com/api'
  private readonly OTP_EXPIRATION_TIME = 5 // minutes
  private readonly MAX_RETRIES = 3

  constructor(config?: Partial<OTPConfig>) {
    this.config = {
      authKey: process.env.MSG91_AUTH_KEY || '',
      expirationTime: config?.expirationTime ?? this.OTP_EXPIRATION_TIME,
      maxRetries: config?.maxRetries ?? this.MAX_RETRIES
    }
  }

  /**
   * Generate OTP and send via MSG91
   * @param phoneNumber - Recipient phone number with country code
   * @returns OTP generation response with status and OTP code
   */
  async generateOTP(phoneNumber: string): Promise<OTPGenerationResponse> {
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(phoneNumber)) {
        return {
          status: 'error',
          message: 'Invalid phone number format. Please provide number with country code (e.g., +919876543210)'
        }
      }

      // Generate 6-digit OTP
      const otpCode = this.generateOTPCode()

      // Send OTP via MSG91
      const sendResponse = await this.sendViaMsg91(phoneNumber, otpCode)

      if (!sendResponse.success) {
        console.error('[OTP] Failed to send OTP via MSG91:', sendResponse.error)
        return {
          status: 'error',
          message: 'Failed to send OTP. Please try again.'
        }
      }

      // Store OTP for verification
      const hash = this.hashOTP(otpCode)
      const now = Date.now()
      const expiresAt = now + this.config.expirationTime * 60 * 1000

      this.otpStorage.set(phoneNumber, {
        phone: phoneNumber,
        code: otpCode,
        hash,
        createdAt: now,
        expiresAt,
        attempts: 0
      })

      // Emit OTP_EVENT
      this.emitOTPEvent({
        phone: phoneNumber,
        code: otpCode,
        verified: false,
        timestamp: Date.now()
      })

      console.log(`[OTP] OTP sent to ${phoneNumber}`)

      return {
        status: 'sent',
        message: `OTP sent to ${phoneNumber}`,
        otp: otpCode, // For testing - in production, don't return the actual OTP
        requestId: sendResponse.requestId
      }
    } catch (error) {
      console.error('[OTP] Error generating OTP:', error)
      return {
        status: 'error',
        message: 'An error occurred while generating OTP. Please try again later.'
      }
    }
  }

  /**
   * Verify OTP code
   * @param phoneNumber - Recipient phone number
   * @param otpCode - OTP code to verify
   * @returns Verification response with status
   */
  async verifyOTP(phoneNumber: string, otpCode: string): Promise<OTPVerificationResponse> {
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(phoneNumber)) {
        return {
          verified: false,
          message: 'Invalid phone number'
        }
      }

      // Get stored OTP
      const storedOTP = this.otpStorage.get(phoneNumber)

      if (!storedOTP) {
        return {
          verified: false,
          message: 'No OTP found for this phone number. Please generate a new OTP.'
        }
      }

      // Check if OTP is expired
      if (Date.now() > storedOTP.expiresAt) {
        this.otpStorage.delete(phoneNumber)
        return {
          verified: false,
          message: 'OTP has expired. Please request a new OTP.'
        }
      }

      // Check max retries
      if (storedOTP.attempts >= this.config.maxRetries) {
        this.otpStorage.delete(phoneNumber)
        return {
          verified: false,
          message: `Too many failed attempts. Please request a new OTP.`
        }
      }

      // Verify OTP code
      const otpMatch = storedOTP.code === otpCode || this.verifyOTPHash(otpCode, storedOTP.hash)

      if (!otpMatch) {
        storedOTP.attempts++
        return {
          verified: false,
          message: `Invalid OTP. You have ${this.config.maxRetries - storedOTP.attempts} attempts remaining.`
        }
      }

      // OTP verified successfully
      this.otpStorage.delete(phoneNumber)

      // Generate auth token for this session
      const token = this.generateAuthToken(phoneNumber)

      // Emit OTP_EVENT for verified OTP
      this.emitOTPEvent({
        phone: phoneNumber,
        code: otpCode,
        verified: true,
        timestamp: Date.now()
      })

      console.log(`[OTP] OTP verified successfully for ${phoneNumber}`)

      return {
        verified: true,
        message: 'OTP verified successfully',
        phone: phoneNumber,
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hour validity
      }
    } catch (error) {
      console.error('[OTP] Error verifying OTP:', error)
      return {
        verified: false,
        message: 'An error occurred while verifying OTP'
      }
    }
  }

  /**
   * Resend OTP to phone number
   * @param phoneNumber - Recipient phone number
   * @returns OTP generation response
   */
  async resendOTP(phoneNumber: string): Promise<OTPGenerationResponse> {
    // Clear existing OTP
    this.otpStorage.delete(phoneNumber)
    
    // Generate new OTP
    return this.generateOTP(phoneNumber)
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns true if valid, false otherwise
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Check if number starts with + and contains only digits after that
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(phoneNumber)
  }

  /**
   * Generate 6-digit OTP code
   * @returns OTP code as string
   */
  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Hash OTP code for secure storage
   * @param otpCode - OTP code to hash
   * @returns Hashed OTP
   */
  private hashOTP(otpCode: string): string {
    // In production, use a real hashing library like bcrypt
    // This is a simple example
    return Buffer.from(otpCode).toString('base64')
  }

  /**
   * Verify OTP against hash
   * @param otpCode - OTP code to verify
   * @param hash - Hash to verify against
   * @returns true if valid, false otherwise
   */
  private verifyOTPHash(otpCode: string, hash: string): boolean {
    // In production, use a real hashing library
    return this.hashOTP(otpCode) === hash
  }

  /**
   * Generate auth token
   * @param phoneNumber - Phone number
   * @returns Auth token
   */
  private generateAuthToken(phoneNumber: string): string {
    return Buffer.from(`${phoneNumber}:${Date.now()}`).toString('base64')
  }

  /**
   * Send OTP via MSG91 API
   * @param phoneNumber - Recipient phone number
   * @param otpCode - OTP code
   * @returns API response
   */
  private async sendViaMsg91(
    phoneNumber: string,
    otpCode: string
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      // In production, use actual HTTP library like axios
      // This is a mock implementation
      const endpoint = `${this.MSG91_ENDPOINT}/sendotp.php`
      const params = new URLSearchParams({
        authkey: this.config.authKey,
        mobile: phoneNumber.replace('+', ''),
        otp: otpCode,
        autoread: 'true',
        template: 'OTP is [[otp]] for your delivery'
      })

      console.log(`[OTP] Sending OTP to MSG91: ${endpoint}?${params.toString()}`)

      // Mock response for testing
      const mockRequestId = `req_${uuid()}`
      
      return {
        success: true,
        requestId: mockRequestId
      }

      // Real implementation would look like:
      // const response = await axios.get(endpoint, { params })
      // return { success: response.data.type === 'success', requestId: response.data.request_id }
    } catch (error) {
      console.error('[OTP] MSG91 API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get OTP entry from storage (for testing/debugging)
   * @param phoneNumber - Phone number to retrieve
   * @returns OTP storage entry or undefined
   */
  getOTPEntry(phoneNumber: string): OTPStorage | undefined {
    return this.otpStorage.get(phoneNumber)
  }

  /**
   * Emit OTP event to EventBus
   * @param payload - Event payload
   */
  private emitOTPEvent(payload: { phone: string; code: string; verified: boolean; timestamp: number }): void {
    const event: OTPEvent = {
      id: uuid(),
      type: 'OTP_EVENT',
      timestamp: payload.timestamp,
      agentId: 'system', // Will be set by actual caller
      payload: {
        phoneNumber: payload.phone,
        otpCode: payload.code,
        verified: payload.verified,
        timestamp: payload.timestamp
      },
      metadata: {
        syncState: 'PENDING',
        attempt: 0
      }
    }

    eventBus.emit(event)
    console.log('[OTP] OTP_EVENT emitted via EventBus')
  }

  /**
   * Handle API request for OTP generation (Express/Next.js handler)
   */
  async handleGenerateRequest(request: OTPRequest): Promise<OTPResponse> {
    const response = await this.generateOTP(request.phone)
    return {
      status: response.status === 'sent' ? 'sent' : 'error',
      message: response.message
    }
  }

  /**
   * Handle API request for OTP verification (Express/Next.js handler)
   */
  async handleVerifyRequest(request: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await this.verifyOTP(request.phone, request.code)
    return {
      status: response.verified ? 'verified' : 'invalid',
      token: response.token,
      message: response.message
    }
  }

  /**
   * Get OTP status (for debugging/testing)
   */
  getOTPStatus(phoneNumber: string): { exists: boolean; expiresIn?: number } {
    const storedOTP = this.otpStorage.get(phoneNumber)
    if (!storedOTP) {
      return { exists: false }
    }
    const expiresIn = Math.max(0, storedOTP.expiresAt - Date.now())
    return { exists: true, expiresIn }
  }

  /**
   * Clear all OTPs (for testing)
   */
  clearAllOTPs(): void {
    this.otpStorage.clear()
  }
}

/**
 * Singleton instance
 */
export const otpModule = new OTPModule()
