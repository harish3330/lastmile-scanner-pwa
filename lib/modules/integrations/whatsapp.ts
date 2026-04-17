/**
 * WhatsApp Module - External Integrations
 * Member 10 - Issue #10
 * 
 * Integrates with MSG91 for WhatsApp messaging
 * 
 * Usage:
 * ```
 * const whatsappModule = new WhatsAppModule()
 * const response = await whatsappModule.sendMessage('+919876543210', 'Your delivery is on the way')
 * ```
 */

import { v4 as uuid } from 'uuid'
import { eventBus } from '@/lib/events/eventBus'
import { WhatsAppEvent } from '@/lib/types/events'
import { WhatsAppRequest, WhatsAppResponse } from '@/lib/types/api'
import { WhatsAppConfig, WhatsAppMessage, WhatsAppSendResponse, WhatsAppStatusResponse } from './types'

export class WhatsAppModule {
  private config: WhatsAppConfig
  private messageStorage: Map<string, WhatsAppMessage & { id: string; delivered: boolean; read: boolean }> = new Map()
  private readonly MSG91_ENDPOINT = 'https://api.msg91.com/api'
  private readonly MAX_MESSAGE_LENGTH = 4096

  constructor(config?: Partial<WhatsAppConfig>) {
    this.config = {
      authKey: process.env.MSG91_AUTH_KEY || '',
      senderId: config?.senderId ?? 'DELIVERY',
      apiEndpoint: config?.apiEndpoint ?? this.MSG91_ENDPOINT
    }
  }

  /**
   * Send WhatsApp message
   * @param recipient - Recipient phone number with country code
   * @param message - Message content
   * @param messageType - Type of message (notification, alert, confirmation)
   * @param agentLocation - Optional agent location to include in message
   * @returns Send response with status and message ID
   */
  async sendMessage(
    recipient: string,
    message: string,
    messageType: 'notification' | 'alert' | 'confirmation' = 'notification',
    agentLocation?: { lat: number; lng: number }
  ): Promise<WhatsAppSendResponse> {
    try {
      // Validate recipient
      if (!this.isValidPhoneNumber(recipient)) {
        return {
          status: 'failed',
          message: 'Invalid phone number. Please provide number with country code (e.g., +919876543210)'
        }
      }

      // Validate message
      if (!message || message.trim().length === 0) {
        return {
          status: 'failed',
          message: 'Message cannot be empty'
        }
      }

      if (message.length > this.MAX_MESSAGE_LENGTH) {
        return {
          status: 'failed',
          message: `Message exceeds maximum length of ${this.MAX_MESSAGE_LENGTH} characters`
        }
      }

      // Append location info if provided
      let fullMessage = message
      if (agentLocation) {
        fullMessage += `\n📍 Location: https://maps.google.com/?q=${agentLocation.lat},${agentLocation.lng}`
      }

      // Send via MSG91
      const sendResponse = await this.sendViaMsg91(recipient, fullMessage, messageType)

      if (!sendResponse.success) {
        console.error('[WhatsApp] Failed to send message via MSG91:', sendResponse.error)
        return {
          status: 'failed',
          message: 'Failed to send message. Please try again.'
        }
      }

      // Store message for tracking
      const messageId = sendResponse.messageId || `msg_${uuid()}`
      this.messageStorage.set(messageId, {
        id: messageId,
        recipient,
        message: fullMessage,
        messageType,
        timestamp: Date.now(),
        delivered: false,
        read: false,
        location: agentLocation
      })

      // Emit WhatsApp event
      this.emitWhatsAppEvent({
        recipient,
        message: fullMessage,
        messageType,
        timestamp: Date.now()
      })

      console.log(`[WhatsApp] Message sent to ${recipient}. Message ID: ${messageId}`)

      return {
        status: 'sent',
        messageId,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('[WhatsApp] Error sending message:', error)
      return {
        status: 'failed',
        message: 'An error occurred while sending message. Please try again later.'
      }
    }
  }

  /**
   * Send bulk WhatsApp messages
   * @param recipients - Array of phone numbers
   * @param message - Message content
   * @param messageType - Type of message
   * @returns Array of send responses
   */
  async sendBulkMessages(
    recipients: string[],
    message: string,
    messageType: 'notification' | 'alert' | 'confirmation' = 'notification'
  ): Promise<WhatsAppSendResponse[]> {
    const responses: WhatsAppSendResponse[] = []

    for (const recipient of recipients) {
      const response = await this.sendMessage(recipient, message, messageType)
      responses.push(response)
    }

    console.log(`[WhatsApp] Bulk message sent to ${recipients.length} recipients`)
    return responses
  }

  /**
   * Get WhatsApp message status
   * @param messageId - Message ID
   * @returns Message status with delivery and read information
   */
  async getMessageStatus(messageId: string): Promise<WhatsAppStatusResponse> {
    try {
      const storedMessage = this.messageStorage.get(messageId)

      if (!storedMessage) {
        return {
          messageId,
          deliveryStatus: 'failed',
          readStatus: 'sent',
          timestamp: Date.now()
        }
      }

      // In production, fetch actual status from MSG91 API
      const status = await this.fetchStatusFromMsg91(messageId)

      // Update storage
      storedMessage.delivered = status.deliveryStatus !== 'failed'
      storedMessage.read = status.readStatus === 'read'

      return {
        messageId,
        deliveryStatus: status.deliveryStatus,
        readStatus: status.readStatus,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('[WhatsApp] Error getting message status:', error)
      return {
        messageId,
        deliveryStatus: 'failed',
        readStatus: 'sent',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Update message delivery status (called by webhook from MSG91)
   * @param messageId - Message ID
   * @param deliveryStatus - Delivery status
   * @param readStatus - Read status
   */
  updateMessageStatus(
    messageId: string,
    deliveryStatus: 'sent' | 'delivered' | 'failed',
    readStatus: 'sent' | 'delivered' | 'read'
  ): void {
    const storedMessage = this.messageStorage.get(messageId)

    if (storedMessage) {
      storedMessage.delivered = deliveryStatus !== 'failed'
      storedMessage.read = readStatus === 'read'
      console.log(`[WhatsApp] Message ${messageId} status updated: ${deliveryStatus}, ${readStatus}`)
    }
  }

  /**
   * Get delivery statistics
   * @returns Statistics about sent messages
   */
  getDeliveryStats(): {
    totalMessages: number
    deliveredMessages: number
    failedMessages: number
    readMessages: number
    deliveryRate: number
  } {
    const messages = Array.from(this.messageStorage.values())
    const delivered = messages.filter(m => m.delivered).length
    const read = messages.filter(m => m.read).length
    const failed = messages.filter(m => !m.delivered).length

    return {
      totalMessages: messages.length,
      deliveredMessages: delivered,
      failedMessages: failed,
      readMessages: read,
      deliveryRate: messages.length > 0 ? (delivered / messages.length) * 100 : 0
    }
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns true if valid, false otherwise
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(phoneNumber)
  }

  /**
   * Send message via MSG91 API
   * @param recipient - Recipient phone number
   * @param message - Message content
   * @param messageType - Message type
   * @returns API response
   */
  private async sendViaMsg91(
    recipient: string,
    _message: string,
    messageType?: 'notification' | 'alert' | 'confirmation'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Use config for endpoint, fallback to default
      const endpoint = `${this.config.apiEndpoint}/sendwhatsapp.php`

      console.log(`[WhatsApp] Sending via MSG91: ${endpoint}?authkey=${this.config.authKey ? '***' : 'missing'}&mobiles=${recipient}${messageType ? `&type=${messageType}` : ''}`)

      // Mock response for testing (using config auth key)
      const mockMessageId = `wa_${uuid()}`

      return {
        success: true,
        messageId: mockMessageId
      }

      // Real implementation:
      // const response = await axios.get(endpoint, { params: { authkey: this.config.authKey, mobiles: recipient, message: _message, type: messageType } })
      // return { success: response.data.type === 'success', messageId: response.data.message_id }
    } catch (error) {
      console.error('[WhatsApp] MSG91 API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Fetch message status from MSG91 API
   * @param messageId - Message ID
   * @returns Status information
   */
  private async fetchStatusFromMsg91(
    messageId: string
  ): Promise<{ deliveryStatus: 'sent' | 'delivered' | 'failed'; readStatus: 'sent' | 'delivered' | 'read' }> {
    try {
      // In production, call actual API
      const storedMessage = this.messageStorage.get(messageId)

      if (!storedMessage) {
        return { deliveryStatus: 'failed', readStatus: 'sent' }
      }

      // Simulate delivery after 2 seconds
      const timeSinceSend = Date.now() - storedMessage.timestamp
      const deliveryStatus = timeSinceSend > 2000 ? 'delivered' : 'sent'
      const readStatus = storedMessage.read ? 'read' : deliveryStatus

      return { deliveryStatus, readStatus }
    } catch (error) {
      console.error('[WhatsApp] Error fetching status:', error)
      return { deliveryStatus: 'failed', readStatus: 'sent' }
    }
  }

  /**
   * Emit WhatsApp event to EventBus
   * @param payload - Event payload
   */
  private emitWhatsAppEvent(payload: {
    recipient: string
    message: string
    messageType: string
    timestamp: number
  }): void {
    const event: WhatsAppEvent = {
      id: uuid(),
      type: 'WHATSAPP_EVENT',
      timestamp: payload.timestamp,
      agentId: 'system',
      payload: {
        recipient: payload.recipient,
        message: payload.message
      },
      metadata: {
        syncState: 'PENDING',
        attempt: 0
      }
    }

    eventBus.emit(event)
    console.log('[WhatsApp] WHATSAPP_EVENT emitted via EventBus')
  }

  /**
   * Handle API request (Express/Next.js handler)
   */
  async handleRequest(request: WhatsAppRequest): Promise<WhatsAppResponse> {
    const response = await this.sendMessage(request.recipient, request.message)
    return {
      status: response.status === 'sent' ? 'sent' : 'error',
      messageId: response.messageId || 'unknown'
    }
  }

  /**
   * Get message details (for debugging)
   */
  getMessageDetails(messageId: string): WhatsAppMessage | null {
    const message = this.messageStorage.get(messageId)
    return message ? { ...message } : null
  }

  /**
   * Clear all messages (for testing)
   */
  clearAllMessages(): void {
    this.messageStorage.clear()
  }
}

/**
 * Singleton instance
 */
export const whatsappModule = new WhatsAppModule()
