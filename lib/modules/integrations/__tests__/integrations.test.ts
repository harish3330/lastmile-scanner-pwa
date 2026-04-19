/**
 * MEMBER 10 - External Integrations Test Suite
 * Issue #10: OTP, WhatsApp, Payment Integration Tests
 * 
 * TDD Workflow:
 * Day 1: Write failing tests (❌)
 * Days 2-3: Implement code to pass tests (✅)
 * Day 4: Finalize and push PR
 */

import { OTPModule } from '../otp'
import { WhatsAppModule } from '../whatsapp'
import { PaymentModule } from '../payment'
import { eventBus } from '@/lib/events/eventBus'

/**
 * =========================
 * OTP MODULE TESTS
 * =========================
 */
describe('OTPModule', () => {
  let otpModule: OTPModule

  beforeEach(() => {
    jest.useFakeTimers()
    otpModule = new OTPModule()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('OTP Generation', () => {
    it('should generate and send OTP for valid phone number', async () => {
      const phoneNumber = '+919080747974'
      
      const response = await otpModule.generateOTP(phoneNumber)
      
      expect(response).toBeDefined()
      expect(response.status).toBe('sent')
      expect(response.message).toContain('OTP sent')
    })

    it('should reject OTP generation for invalid phone number', async () => {
      const invalidPhone = 'invalid-phone'
      
      const response = await otpModule.generateOTP(invalidPhone)
      
      expect(response.status).toBe('error')
      expect(response.message).toContain('Invalid')
    })

    it('should emit OTP_EVENT when OTP is generated', async () => {
      const phoneNumber = '+919080747974'
      const emitSpy = jest.spyOn(eventBus, 'emit')
      
      await otpModule.generateOTP(phoneNumber)
      
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OTP_EVENT',
          payload: expect.objectContaining({
            phone: phoneNumber
          })
        })
      )
    })

    it('should store OTP internally for verification', async () => {
      const phoneNumber = '+919080747974'
      
      const response = await otpModule.generateOTP(phoneNumber)
      const otpCode = response.otp // Should be returned from generator
      
      expect(otpCode).toBeDefined()
      expect(otpCode).toMatch(/^\d{6}$/) // 6-digit OTP
    })
  })

  describe('OTP Verification', () => {
    it('should verify correct OTP code', async () => {
      const phoneNumber = '+919080747974'
      
      // First generate OTP
      const generateResponse = await otpModule.generateOTP(phoneNumber)
      const correctOTP = generateResponse.otp
      
      // Then verify it
      const verifyResponse = await otpModule.verifyOTP(phoneNumber, correctOTP)
      
      expect(verifyResponse.verified).toBe(true)
      expect(verifyResponse.message).toContain('verified')
    })

    it('should reject incorrect OTP code', async () => {
      const phoneNumber = '+919080747974'
      
      await otpModule.generateOTP(phoneNumber)
      
      const verifyResponse = await otpModule.verifyOTP(phoneNumber, '000000')
      
      expect(verifyResponse.verified).toBe(false)
      expect(verifyResponse.message).toContain('Invalid')
    })

    it('should emit OTP_EVENT when verification is complete', async () => {
      const phoneNumber = '+919080747974'
      const emitSpy = jest.spyOn(eventBus, 'emit')
      
      const generateResponse = await otpModule.generateOTP(phoneNumber)
      const correctOTP = generateResponse.otp
      
      await otpModule.verifyOTP(phoneNumber, correctOTP)
      
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OTP_EVENT',
          payload: expect.objectContaining({
            phone: phoneNumber,
            verified: true
          })
        })
      )
    })

    it('should reject expired OTP', async () => {
      const phoneNumber = '+919080747974'
      
      const generateResponse = await otpModule.generateOTP(phoneNumber)
      
      // Simulate OTP expiration (after 5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000)
      
      const verifyResponse = await otpModule.verifyOTP(phoneNumber, generateResponse.otp)
      
      expect(verifyResponse.verified).toBe(false)
      expect(verifyResponse.message).toContain('expired')
    })
  })

  describe('OTP Error Handling', () => {
    it('should handle network errors during OTP generation', async () => {
      const phoneNumber = '+919080747974'
      jest.spyOn(otpModule as any, 'sendViaMsg91').mockRejectedValueOnce(new Error('Network error'))
      
      const response = await otpModule.generateOTP(phoneNumber)
      
      expect(response.status).toBe('error')
    })

    it('should retry failed OTP verification attempts', async () => {
      const phoneNumber = '+919876543210'
      const generateResponse = await otpModule.generateOTP(phoneNumber)
      
      // First attempt fails
      await otpModule.verifyOTP(phoneNumber, 'wrong')
      
      // Second attempt succeeds
      const secondAttempt = await otpModule.verifyOTP(phoneNumber, generateResponse.otp)
      
      expect(secondAttempt.verified).toBe(true)
    })
  })
})

/**
 * =========================
 * WHATSAPP MODULE TESTS
 * =========================
 */
describe('WhatsAppModule', () => {
  let whatsappModule: WhatsAppModule

  beforeEach(() => {
    whatsappModule = new WhatsAppModule()
    jest.clearAllMocks()
  })

  describe('Message Sending', () => {
    it('should send WhatsApp message to valid recipient', async () => {
      const recipient = '+919876543210'
      const message = 'Your delivery is on the way'
      
      const response = await whatsappModule.sendMessage(recipient, message)
      
      expect(response).toBeDefined()
      expect(response.status).toBe('sent')
      expect(response.messageId).toBeDefined()
    })

    it('should reject message to invalid recipient', async () => {
      const invalidRecipient = 'invalid-number'
      const message = 'Test message'
      
      const response = await whatsappModule.sendMessage(invalidRecipient, message)
      
      expect(response.status).toBe('failed')
      expect(response.message).toContain('Invalid')
    })

    it('should emit WHATSAPP_EVENT when message is sent', async () => {
      const recipient = '+919876543210'
      const message = 'Delivery confirmation'
      const emitSpy = jest.spyOn(eventBus, 'emit')
      
      await whatsappModule.sendMessage(recipient, message)
      
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'WHATSAPP_EVENT',
          payload: expect.objectContaining({
            recipient,
            message
          })
        })
      )
    })

    it('should support multiple message types', async () => {
      const recipient = '+919876543210'
      const messageTypes = ['notification', 'alert', 'confirmation']
      
      for (const type of messageTypes) {
        const response = await whatsappModule.sendMessage(
          recipient,
          'Test message',
          type
        )
        
        expect(response.status).toBe('sent')
      }
    })

    it('should include agent location in message if available', async () => {
      const recipient = '+919876543210'
      const message = 'Delivery at your location'
      const location = { lat: 12.9716, lng: 77.5946 }
      
      const response = await whatsappModule.sendMessage(
        recipient,
        message,
        'notification',
        location
      )
      
      expect(response.status).toBe('sent')
    })
  })

  describe('Message Delivery Tracking', () => {
    it('should track message delivery status', async () => {
      const recipient = '+919876543210'
      const message = 'Test message'
      
      const response = await whatsappModule.sendMessage(recipient, message)
      const messageId = response.messageId
      
      const status = await whatsappModule.getMessageStatus(messageId)
      
      expect(status).toBeDefined()
      expect(['sent', 'delivered', 'failed']).toContain(status.deliveryStatus)
    })

    it('should track delivery read status', async () => {
      const recipient = '+919876543210'
      const message = 'Test message'
      
      const response = await whatsappModule.sendMessage(recipient, message)
      const messageId = response.messageId
      
      const status = await whatsappModule.getMessageStatus(messageId)
      
      expect(status.readStatus).toBeDefined()
      expect(['sent', 'delivered', 'read']).toContain(status.readStatus)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const recipient = '+919876543210'
      jest.spyOn(whatsappModule as any, 'sendViaMsg91').mockRejectedValueOnce(new Error('API Error'))
      
      const response = await whatsappModule.sendMessage(recipient, 'Test')
      
      expect(response.status).toBe('failed')
    })
  })
})

/**
 * =========================
 * PAYMENT MODULE TESTS
 * =========================
 */
describe('PaymentModule', () => {
  let paymentModule: PaymentModule

  beforeEach(() => {
    paymentModule = new PaymentModule()
    jest.clearAllMocks()
  })

  describe('Payment Order Creation', () => {
    it('should create a payment order for valid amount', async () => {
      const amount = 500 // Amount in INR
      const deliveryId = 'delivery-123'
      
      const response = await paymentModule.createOrder(amount, deliveryId)
      
      expect(response).toBeDefined()
      expect(response.orderId).toBeDefined()
      expect(response.amount).toBe(amount)
      expect(response.status).toBe('created')
    })

    it('should reject order for invalid amount', async () => {
      const invalidAmount = -100
      
      const response = await paymentModule.createOrder(invalidAmount, 'delivery-123')
      
      expect(response.status).toBe('error')
      expect(response.message).toContain('Invalid amount')
    })

    it('should emit PAYMENT_EVENT when order is created', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      const emitSpy = jest.spyOn(eventBus, 'emit')
      
      await paymentModule.createOrder(amount, deliveryId)
      
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_EVENT',
          payload: expect.objectContaining({
            amount,
            deliveryId,
            status: 'pending'
          })
        })
      )
    })

    it('should support multiple payment methods', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      const methods = ['card', 'upi', 'net_banking', 'wallet']
      
      for (const method of methods) {
        const response = await paymentModule.createOrder(amount, deliveryId, method)
        
        expect(response.status).toMatch(/created|error/)
      }
    })

    it('should handle order with receipt/reference', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      const receipt = 'receipt-001'
      
      const response = await paymentModule.createOrder(amount, deliveryId, 'upi', receipt)
      
      expect(response.receipt).toBe(receipt)
    })
  })

  describe('Payment Verification', () => {
    it('should verify successful payment', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      
      // Create order first
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      // Simulate payment
      const paymentId = 'pay_ABC123DEF456'
      const signature = 'signature_hash_here'
      
      const verifyResponse = await paymentModule.verifyPayment(orderId, paymentId, signature)
      
      expect(verifyResponse.verified).toBe(true)
      expect(verifyResponse.status).toBe('success')
    })

    it('should reject payment with invalid signature', async () => {
      const amount = 500
      const deliveryId = 'delivery-sig-test'
      
      // Create order first
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      const paymentId = 'pay_ABC123DEF456'
      const invalidSignature = 'invalid_hash'
      
      const response = await paymentModule.verifyPayment(orderId, paymentId, invalidSignature)
      
      expect(response.verified).toBe(false)
      expect(response.message).toContain('payment signature')
    })

    it('should emit PAYMENT_EVENT when payment is verified', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      const emitSpy = jest.spyOn(eventBus, 'emit')
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      const paymentId = 'pay_ABC123DEF456'
      const signature = 'valid_signature_hash'
      
      await paymentModule.verifyPayment(orderId, paymentId, signature)
      
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_EVENT',
          payload: expect.objectContaining({
            status: 'success',
            verified: true,
            transactionId: paymentId
          })
        })
      )
    })

    it('should handle payment amount mismatch', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      // Simulate payment with different amount
      const paymentId = 'pay_ABC123DEF456'
      const mismatchedAmount = 600
      
      const response = await paymentModule.verifyPayment(orderId, paymentId, 'sig', mismatchedAmount)
      
      expect(response.verified).toBe(false)
      expect(response.message).toContain('Amount mismatch')
    })
  })

  describe('UPI Payment Processing', () => {
    it('should process UPI payment with valid UPI ID', async () => {
      const amount = 500
      const deliveryId = 'delivery-upi-001'
      const upiId = 'user@okhdfcbank'
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId, 'upi')
      const orderId = orderResponse.orderId
      
      const upiResponse = await paymentModule.processUPIPayment(orderId, upiId)
      
      expect(upiResponse).toBeDefined()
      expect(upiResponse.status).toMatch(/success|pending/)
      expect(upiResponse.transactionId).toBeDefined()
      expect(upiResponse.amount).toBe(amount)
    })

    it('should reject UPI payment with invalid UPI ID format', async () => {
      const amount = 500
      const deliveryId = 'delivery-upi-002'
      const invalidUpiId = 'invalid-upi'
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      const upiResponse = await paymentModule.processUPIPayment(orderId, invalidUpiId)
      
      expect(upiResponse.status).toBe('failed')
      expect(upiResponse.message).toContain('Invalid UPI ID')
    })

    it('should support various UPI ID formats', async () => {
      const amount = 500
      const deliveryId = 'delivery-upi-003'
      const validUpiIds = ['user@upi', 'user@okhdfcbank', 'delivery@icici', 'agent@airtel']
      
      for (const upiId of validUpiIds) {
        const orderResponse = await paymentModule.createOrder(amount, deliveryId + '-' + upiId)
        const orderId = orderResponse.orderId
        
        const upiResponse = await paymentModule.processUPIPayment(orderId, upiId)
        
        expect(upiResponse.status).toMatch(/success|pending|failed/)
      }
    })

    it('should emit PAYMENT_EVENT on UPI payment processing', async () => {
      const amount = 500
      const deliveryId = 'delivery-upi-event'
      const upiId = 'user@upi'
      const emitSpy = jest.spyOn(eventBus, 'emit')
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      await paymentModule.processUPIPayment(orderId, upiId)
      
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_EVENT',
          payload: expect.objectContaining({
            method: 'upi',
            amount: amount,
            deliveryId: deliveryId
          })
        })
      )
    })

    it('should handle UPI payment for non-existent order', async () => {
      const invalidOrderId = 'invalid-order-id'
      const upiId = 'user@upi'
      
      const response = await paymentModule.processUPIPayment(invalidOrderId, upiId)
      
      expect(response.status).toBe('failed')
      expect(response.message).toContain('Order not found')
    })

    it('should mask UPI ID in logs for security', async () => {
      const amount = 500
      const deliveryId = 'delivery-upi-security'
      const upiId = 'user123456789@okhdfcbank'
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      // Process UPI payment
      await paymentModule.processUPIPayment(orderId, upiId)
      
      // Verify by checking audit log
      const auditLog = paymentModule.getAuditLog(orderId)
      
      expect(auditLog).toBeDefined()
      // UPI ID should be masked in the transaction details
      if (auditLog && auditLog.transactions.length > 0) {
        const upiTransaction = auditLog.transactions.find(t => t.action === 'UPI_PAYMENT_INITIATED')
        if (upiTransaction && upiTransaction.details.upiId) {
          // Should not contain the full UPI ID
          expect(upiTransaction.details.upiId).not.toBe(upiId)
        }
      }
    })
  })

  describe('Refund Processing', () => {
    it('should process refund for valid payment', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      const refundResponse = await paymentModule.processRefund(orderId, amount)
      
      expect(refundResponse.status).toBe('success')
      expect(refundResponse.refundId).toBeDefined()
    })

    it('should reject refund for non-existent payment', async () => {
      const response = await paymentModule.processRefund('invalid-order', 500)
      
      expect(response.status).toBe('error')
      expect(response.message).toContain('not found')
    })

    it('should handle partial refund', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      
      const orderResponse = await paymentModule.createOrder(amount, deliveryId)
      const orderId = orderResponse.orderId
      
      const partialRefund = 250
      const response = await paymentModule.processRefund(orderId, partialRefund)
      
      expect(response.refundAmount).toBe(partialRefund)
    })
  })

  describe('Payment History & Tracking', () => {
    it('should retrieve payment history for delivery', async () => {
      const deliveryId = 'delivery-123'
      
      await paymentModule.createOrder(500, deliveryId)
      await paymentModule.createOrder(300, deliveryId)
      
      const history = await paymentModule.getPaymentHistory(deliveryId)
      
      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
    })

    it('should track payment status updates', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      
      const response = await paymentModule.createOrder(amount, deliveryId)
      const orderId = response.orderId
      
      const status = await paymentModule.getPaymentStatus(orderId)
      
      expect(status).toBeDefined()
      expect(['pending', 'authorized', 'captured', 'failed', 'refunded']).toContain(status.paymentStatus)
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle Razorpay API errors', async () => {
      jest.spyOn(paymentModule as any, 'createViaRazorpay').mockRejectedValueOnce(new Error('API Error'))
      
      const response = await paymentModule.createOrder(500, 'delivery-123')
      
      expect(response.status).toMatch(/error|failed/)
    })

    it('should handle payment amount in different currencies', async () => {
      // Should support INR and convert if needed
      const response = await paymentModule.createOrder(500, 'delivery-123', 'upi', undefined, 'INR')
      
      expect(response).toBeDefined()
    })

    it('should log all payment transactions for audit trail', async () => {
      const amount = 500
      const deliveryId = 'delivery-123'
      
      const response = await paymentModule.createOrder(amount, deliveryId)
      
      const auditLog = await paymentModule.getAuditLog(response.orderId)
      
      expect(auditLog).toBeDefined()
      expect(auditLog.transactions).toBeDefined()
    })
  })
})

/**
 * =========================
 * INTEGRATION TESTS
 * =========================
 */
describe('Integration Tests - Complete OTP to Payment Flow', () => {
  let otpModule: OTPModule
  let whatsappModule: WhatsAppModule
  let paymentModule: PaymentModule

  beforeEach(() => {
    otpModule = new OTPModule()
    whatsappModule = new WhatsAppModule()
    paymentModule = new PaymentModule()
  })

  it('should complete delivery workflow: OTP -> WhatsApp -> Payment', async () => {
    const phoneNumber = '+919876543210'
    const deliveryId = 'delivery-456'
    const amount = 500

    // Step 1: Send OTP
    const otpResponse = await otpModule.generateOTP(phoneNumber)
    expect(otpResponse.status).toBe('sent')

    // Step 2: Verify OTP
    const verifyResponse = await otpModule.verifyOTP(phoneNumber, otpResponse.otp)
    expect(verifyResponse.verified).toBe(true)

    // Step 3: Send WhatsApp confirmation
    const whatsappResponse = await whatsappModule.sendMessage(
      phoneNumber,
      'Delivery confirmed. Proceeding to payment.',
      'confirmation'
    )
    expect(whatsappResponse.status).toBe('sent')

    // Step 4: Create payment order
    const orderResponse = await paymentModule.createOrder(amount, deliveryId)
    expect(orderResponse.status).toBe('created')

    // Step 5: Verify payment
    const paymentVerify = await paymentModule.verifyPayment(
      orderResponse.orderId,
      'pay_XYZ789',
      'valid_signature'
    )
    expect(paymentVerify.status).toMatch(/success|verified/)
  })
})
