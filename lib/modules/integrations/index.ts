/**
 * Barrel Export for Integration Modules
 * Member 10 - External Integrations
 * 
 * Export all modules and utilities from this folder
 */

// Export module classes and singleton instances
export { OTPModule, otpModule } from './otp'
export { WhatsAppModule, whatsappModule } from './whatsapp'
export { PaymentModule, paymentModule } from './payment'

// Re-export all types and error classes from types file
export type * from './types'
export { IntegrationError, OTPErrorClass, WhatsAppErrorClass, PaymentErrorClass } from './types'

/**
 * Singleton instances - Use these to access the modules
 * 
 * Example:
 * ```
 * import { otpModule, whatsappModule, paymentModule } from '@/lib/modules/integrations'
 * 
 * const otp = await otpModule.generateOTP('+919876543210')
 * const message = await whatsappModule.sendMessage('+919876543210', 'Hello!')
 * const order = await paymentModule.createOrder(50000, 'delivery_123')
 * const upiPayment = await paymentModule.processUPIPayment(order.orderId, 'user@okhdfcbank')
 * ```
 */
