/**
 * Local Type Definitions for Integration Modules
 * Member 10 - External Integrations
 */

/**
 * OTP Module Types
 */
export interface OTPConfig {
  authKey: string
  expirationTime: number // in minutes
  maxRetries: number
}

export interface OTPGenerationResponse {
  status: 'sent' | 'error'
  message: string
  otp?: string
  requestId?: string
}

export interface OTPVerificationResponse {
  verified: boolean
  message: string
  phone?: string
  token?: string
  expiresAt?: number
}

export interface OTPStorage {
  phone: string
  code: string
  hash: string
  createdAt: number
  expiresAt: number
  attempts: number
}

/**
 * OTP Response Type (for API)
 */
export interface OTPResponse {
  status: 'sent' | 'error'
  message: string
  token?: string
}

/**
 * WhatsApp Module Types
 */
export interface WhatsAppConfig {
  authKey: string
  senderId: string
  apiEndpoint: string
}

export interface WhatsAppMessage {
  recipient: string
  message: string
  messageType?: 'notification' | 'alert' | 'confirmation'
  location?: { lat: number; lng: number }
  timestamp: number
}

export interface WhatsAppSendResponse {
  status: 'sent' | 'failed'
  messageId?: string
  message?: string
  timestamp?: number
}

export interface WhatsAppStatusResponse {
  messageId: string
  deliveryStatus: 'sent' | 'delivered' | 'failed'
  readStatus: 'sent' | 'delivered' | 'read'
  timestamp: number
}

export interface WhatsAppStorage {
  messageId: string
  recipient: string
  content: string
  messageType: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  sentAt: number
  deliveredAt?: number
  readAt?: number
  failureReason?: string
}

/**
 * Payment Module Types
 */
export interface PaymentConfig {
  keyId: string
  keySecret: string
  currency: string
  timeout: number
}

/**
 * UPI Payment Types
 */
export interface UPIConfig {
  merchantId: string
  merchantSecret: string
  apiEndpoint: string
}

export interface UPIPaymentRequest {
  upiId: string
  amount: number
  description: string
  transactionId: string
}

export interface UPIPaymentResponse {
  status: 'success' | 'pending' | 'failed'
  transactionId: string
  upiId: string
  amount: number
  timestamp: number
  message?: string
}

export interface PaymentOrder {
  orderId: string
  deliveryId: string
  amount: number
  currency: string
  method?: string
  receipt?: string
  notes?: Record<string, any>
  createdAt: number
  expiresAt: number
}

export interface PaymentOrderResponse {
  orderId?: string
  amount: number
  currency: string
  status: 'created' | 'error'
  message?: string
  receipt?: string
}

export interface PaymentVerificationResponse {
  verified: boolean
  status: 'success' | 'failed' | 'error'
  message?: string
  transactionId?: string
  paymentId?: string
  orderId?: string
  amount?: number
}

export interface PaymentRefundResponse {
  status: 'success' | 'error'
  refundId?: string
  refundAmount?: number
  message?: string
  originalAmount?: number
}

export interface PaymentStatus {
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
  orderId: string
  amount: number
  lastUpdated: number
  failureReason?: string
}

export interface PaymentHistory {
  orderId: string
  deliveryId: string
  amount: number
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
  createdAt: number
  completedAt?: number
}

export interface PaymentAuditLog {
  orderId: string
  transactions: Array<{
    action: string
    status: string
    timestamp: number
    details: Record<string, any>
  }>
}

/**
 * Error Classes
 */
export class IntegrationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'IntegrationError'
  }
}

export class OTPErrorClass extends IntegrationError {
  constructor(message: string, code: string, statusCode?: number) {
    super(code, message, statusCode)
    this.name = 'OTPError'
  }
}

export class WhatsAppErrorClass extends IntegrationError {
  constructor(message: string, code: string, statusCode?: number) {
    super(code, message, statusCode)
    this.name = 'WhatsAppError'
  }
}

export class PaymentErrorClass extends IntegrationError {
  constructor(message: string, code: string, statusCode?: number) {
    super(code, message, statusCode)
    this.name = 'PaymentError'
  }
}
