/**
 * ISSUE #10 - WhatsApp Service
 * Handles WhatsApp messaging for delivery notifications and status tracking
 * 
 * Dependency: WhatsApp Module (external integration with MSG91)
 * Integration: Uses eventBus for WHATSAPP_EVENT publishing
 */

import { whatsappModule } from '@/lib/modules/integrations'
import { eventBus } from '@/lib/events/eventBus'
import type { WhatsappEvent } from '@/lib/types/events'

export interface WhatsAppServiceRequest {
  recipient: string
  message: string
  messageType?: 'notification' | 'alert' | 'confirmation'
  agentLocation?: {
    lat: number
    lng: number
  }
}

export interface WhatsAppServiceResponse {
  status: 'sent' | 'error'
  message: string
  messageId?: string
}

export interface WhatsAppStatusServiceResponse {
  status: 'success' | 'error'
  messageId?: string
  deliveryStatus?: string
  readStatus?: boolean
  sentAt?: number
  deliveredAt?: number
  readAt?: number
  message?: string
}

export class WhatsAppService {
  /**
   * Send WhatsApp message
   * Validates recipient and message, then delegates to WhatsApp module
   */
  async sendMessage(
    recipient: string,
    message: string,
    messageType: 'notification' | 'alert' | 'confirmation' = 'notification',
    agentLocation?: { lat: number; lng: number }
  ): Promise<WhatsAppServiceResponse> {
    try {
      if (!recipient || typeof recipient !== 'string') {
        return {
          status: 'error',
          message: 'Recipient phone number is required'
        }
      }

      // Validate phone format
      const cleanPhone = recipient.replace(/[\s\-\(\)]/g, '')
      if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
        return {
          status: 'error',
          message: 'Invalid phone number format. Please provide number with country code (e.g., +919876543210)'
        }
      }

      if (!message || typeof message !== 'string') {
        return {
          status: 'error',
          message: 'Message content is required'
        }
      }

      // Validate message length (WhatsApp limit)
      if (message.length > 4096) {
        return {
          status: 'error',
          message: 'Message exceeds maximum length of 4096 characters'
        }
      }

      // Validate message type
      if (messageType && !['notification', 'alert', 'confirmation'].includes(messageType)) {
        return {
          status: 'error',
          message: 'Invalid message type. Must be: notification, alert, or confirmation'
        }
      }

      // Validate location coordinates if provided
      if (agentLocation) {
        if (
          typeof agentLocation.lat !== 'number' ||
          typeof agentLocation.lng !== 'number' ||
          agentLocation.lat < -90 ||
          agentLocation.lat > 90 ||
          agentLocation.lng < -180 ||
          agentLocation.lng > 180
        ) {
          return {
            status: 'error',
            message: 'Invalid location coordinates'
          }
        }
      }

      // Call WhatsApp module to send message
      const result = await whatsappModule.sendMessage(recipient, message, messageType, agentLocation)

      if (result.status === 'sent' || result.status !== 'failed') {
        // Publish WHATSAPP_EVENT
        this.emitWhatsAppEvent({
          recipient,
          message,
          messageType,
          sentAt: Date.now(),
          timestamp: Date.now()
        })

        return {
          status: 'sent',
          message: 'WhatsApp message sent successfully',
          messageId: result.messageId || `msg_${Date.now()}`
        }
      } else {
        return {
          status: 'error',
          message: result.message || 'Failed to send WhatsApp message'
        }
      }
    } catch (error) {
      console.error('[WhatsAppService] Error sending message:', error)
      return {
        status: 'error',
        message: 'An error occurred while sending WhatsApp message. Please try again later.'
      }
    }
  }

  /**
   * Get WhatsApp message status
   * Checks delivery and read status of a sent message
   */
  async getMessageStatus(messageId: string): Promise<WhatsAppStatusServiceResponse> {
    try {
      if (!messageId || typeof messageId !== 'string') {
        return {
          status: 'error',
          message: 'Message ID is required'
        }
      }

      // Call WhatsApp module to get status
      const result = await whatsappModule.getMessageStatus(messageId)

      if (result && result.messageId) {
        return {
          status: 'success',
          messageId: result.messageId,
          deliveryStatus: result.deliveryStatus || 'UNKNOWN',
          readStatus: result.readStatus === 'read',
          sentAt: result.sentAt,
          deliveredAt: result.deliveredAt,
          readAt: result.readAt
        }
      } else {
        return {
          status: 'error',
          message: 'Message not found'
        }
      }
    } catch (error) {
      console.error('[WhatsAppService] Error getting message status:', error)
      return {
        status: 'error',
        message: 'An error occurred while fetching message status. Please try again later.'
      }
    }
  }

  /**
   * Emit WhatsApp event to event bus
   */
  private emitWhatsAppEvent(data: WhatsappEvent) {
    try {
      eventBus.publish('WHATSAPP_EVENT', data)
    } catch (error) {
      console.warn('[WhatsAppService] Failed to emit WHATSAPP_EVENT:', error)
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()
